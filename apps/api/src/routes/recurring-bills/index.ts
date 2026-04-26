import { createHonoInstance } from "#api/lib/create-app.ts";
import { workspaceMember } from "#api/middlewares/workspace-member.ts";
import { RecurringBillRepository } from "#api/routes/recurring-bills/repository.ts";
import {
	InsertRecurringBillSchema,
	RecurringBillSchema,
	RecurringBillsSchema,
	UnifiedBillsSchema,
	UpdateRecurringBillSchema,
	UpcomingBillsSchema,
} from "#api/routes/recurring-bills/schema.ts";
import { idParamValidator } from "#api/validators/id-param.ts";
import { jsonBodyValidator } from "#api/validators/json-body.ts";
import { workspaceQueryValidator } from "#api/validators/workspace-query.ts";
import { generateId } from "@hoalu/common/generate-id";
import { HTTPStatus } from "@hoalu/common/http-status";
import { monetary } from "@hoalu/common/monetary";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import * as z from "zod";

const app = createHonoInstance();
const repository = new RecurringBillRepository();
const TAGS = ["Recurring Bills"];

const route = app
	.get(
		"/",
		describeRoute({
			tags: TAGS,
			summary: "List all active recurring bills",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.response(z.object({ data: RecurringBillsSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const bills = await repository.findAllByWorkspaceId({ workspaceId: workspace.id });

			const parsed = RecurringBillsSchema.safeParse(
				bills.map((b) => ({ ...b, wallet: b.wallet, category: b.category })),
			);
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	)
	.get(
		"/upcoming",
		describeRoute({
			tags: TAGS,
			summary: "Get projected upcoming occurrences (1 month, yearly bills 1 year)",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.response(z.object({ data: UpcomingBillsSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const upcoming = await repository.findUpcoming({ workspaceId: workspace.id });

			const parsed = UpcomingBillsSchema.safeParse(upcoming);
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	)
	.get(
		"/unified",
		describeRoute({
			tags: TAGS,
			summary: "Get unified bills: overdue, today, and upcoming with payment status",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.response(z.object({ data: UnifiedBillsSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const unified = await repository.findUnified({ workspaceId: workspace.id });

			const parsed = UnifiedBillsSchema.safeParse(unified);
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	)
	.post(
		"/",
		describeRoute({
			tags: TAGS,
			summary: "Create a standalone recurring bill",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: RecurringBillSchema }), HTTPStatus.codes.CREATED),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(InsertRecurringBillSchema),
		async (c) => {
			const user = c.get("user");
			if (!user) {
				throw new HTTPException(HTTPStatus.codes.UNAUTHORIZED, {
					message: HTTPStatus.phrases.UNAUTHORIZED,
				});
			}

		const workspace = c.get("workspace");
		const payload = c.req.valid("json");
		const { amount, currency, dueDay, dueMonth, anchorDate, repeat, ...rest } = payload;
		const realAmount = monetary.toRealAmount(amount, currency);

		// Derive anchorDate and due_day/due_month from the payload:
		// - yearly: anchorDate is required, dueDay/dueMonth extracted from it
		// - monthly: dueDay is required, anchorDate synthesized as current-year-month + dueDay
		// - weekly: dueDay is required (0-6), anchorDate synthesized as the next matching weekday
		// - daily: no anchor needed, use today
		const today = new Date();
		const pad = (n: number) => String(n).padStart(2, "0");
		let resolvedAnchorDate: string;
		let resolvedDueDay: number | null = dueDay ?? null;
		let resolvedDueMonth: number | null = dueMonth ?? null;

		if (repeat === "yearly") {
			if (!anchorDate) {
				return c.json({ message: "anchorDate is required for yearly bills" }, HTTPStatus.codes.BAD_REQUEST);
			}
			resolvedAnchorDate = anchorDate;
			const d = new Date(`${anchorDate}T00:00:00`);
			resolvedDueDay = d.getDate();
			resolvedDueMonth = d.getMonth() + 1;
		} else if (repeat === "monthly") {
			const day = dueDay ?? today.getDate();
			resolvedDueDay = day;
			resolvedDueMonth = null;
			resolvedAnchorDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(day)}`;
		} else if (repeat === "weekly") {
			const dow = dueDay ?? today.getDay();
			resolvedDueDay = dow;
			resolvedDueMonth = null;
			// Synthesize anchor as the most recent occurrence of that weekday
			const diff = ((today.getDay() - dow) + 7) % 7;
			const anchor = new Date(today);
			anchor.setDate(today.getDate() - diff);
			resolvedAnchorDate = `${anchor.getFullYear()}-${pad(anchor.getMonth() + 1)}-${pad(anchor.getDate())}`;
		} else {
			// daily or one-time
			resolvedAnchorDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
		}

		const bill = await repository.insert({
			id: generateId({ use: "uuid" }),
			publicId: generateId({ use: "nanoid", kind: "recurring_bill" }),
			...rest,
			repeat,
			amount: `${realAmount}`,
			currency,
			anchorDate: resolvedAnchorDate,
			dueDay: resolvedDueDay,
			dueMonth: resolvedDueMonth,
			workspaceId: workspace.id,
			creatorId: user.id,
		});

			if (!bill) {
				return c.json({ message: "Create failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const full = await repository.findOne({ id: bill.id, workspaceId: workspace.id });
			const parsed = RecurringBillSchema.safeParse(full);
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.CREATED);
		},
	)
	.patch(
		"/:id",
		describeRoute({
			tags: TAGS,
			summary: "Update a recurring bill",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: RecurringBillSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(UpdateRecurringBillSchema),
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");
			const payload = c.req.valid("json");

			const existing = await repository.findOne({ id: param.id, workspaceId: workspace.id });
			if (!existing) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

		const { amount, currency, dueDay, dueMonth, ...rest } = payload;
		const resolvedCurrency = currency ?? existing.currency;
		const realAmount =
			amount !== undefined ? monetary.toRealAmount(amount, resolvedCurrency) : existing.amount;

		// When dueDay changes, also update anchorDate for yearly bills
		// (monthly/weekly anchors are synthetic and not user-meaningful)
		let updatedAnchorDate: string | undefined;
		if (dueDay !== undefined && existing.repeat === "yearly") {
			const resolvedDueMonth = dueMonth ?? existing.dueMonth ?? new Date().getMonth() + 1;
			const year = new Date().getFullYear();
			const pad = (n: number) => String(n).padStart(2, "0");
			updatedAnchorDate = `${year}-${pad(resolvedDueMonth)}-${pad(dueDay)}`;
		}

		await repository.update({
			id: param.id,
			workspaceId: workspace.id,
			payload: {
				...rest,
				amount: `${realAmount}`,
				currency: resolvedCurrency,
				...(dueDay !== undefined && { dueDay }),
				...(dueMonth !== undefined && { dueMonth }),
				...(updatedAnchorDate !== undefined && { anchorDate: updatedAnchorDate }),
			},
		});

			const full = await repository.findOne({ id: param.id, workspaceId: workspace.id });
			const parsed = RecurringBillSchema.safeParse(full);
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	)
	.post(
		"/:id/archive",
		describeRoute({
			tags: TAGS,
			summary: "Archive (soft-delete) a recurring bill",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.not_found(),
				...OpenAPI.response(z.object({ data: z.object({ id: z.string() }) }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const existing = await repository.findOne({ id: param.id, workspaceId: workspace.id });
			if (!existing) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const result = await repository.archive({ id: param.id, workspaceId: workspace.id });
			return c.json({ data: result }, HTTPStatus.codes.OK);
		},
	)
	.post(
		"/:id/unarchive",
		describeRoute({
			tags: TAGS,
			summary: "Unarchive (restore) a recurring bill",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.not_found(),
				...OpenAPI.response(z.object({ data: z.object({ id: z.string() }) }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const existing = await repository.findOne({ id: param.id, workspaceId: workspace.id });
			if (!existing) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const result = await repository.unarchive({ id: param.id, workspaceId: workspace.id });
			return c.json({ data: result }, HTTPStatus.codes.OK);
		},
	)
	.delete(
		"/:id",
		describeRoute({
			tags: TAGS,
			summary:
				"Permanently delete an archived recurring bill (linked expenses are unlinked, not deleted)",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.not_found(),
				...OpenAPI.response(z.object({ data: z.object({ id: z.uuidv7() }) }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const user = c.get("user");
			if (!user) {
				throw new HTTPException(HTTPStatus.codes.UNAUTHORIZED, {
					message: HTTPStatus.phrases.UNAUTHORIZED,
				});
			}

			const workspace = c.get("workspace");
			const membership = c.get("membership");
			const param = c.req.valid("param");

			const existing = await repository.findRaw({ id: param.id, workspaceId: workspace.id });
			if (!existing) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			if (existing.creatorId !== user.id && membership.role !== "owner") {
				return c.json(
					{ message: "You don't have permission to permanently delete this bill." },
					HTTPStatus.codes.FORBIDDEN,
				);
			}

			// Bills must be archived first — prevents accidental hard-delete of active bills.
			if (existing.isActive) {
				return c.json(
					{ message: "Bill must be archived before it can be permanently deleted." },
					HTTPStatus.codes.CONFLICT,
				);
			}

			const deleted = await repository.permanentDelete({ id: param.id, workspaceId: workspace.id });
			if (!deleted) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			return c.json({ data: { id: deleted.id } }, HTTPStatus.codes.OK);
		},
	);

export default route;
