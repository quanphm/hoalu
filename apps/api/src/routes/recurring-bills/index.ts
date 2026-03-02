import { createHonoInstance } from "#api/lib/create-app.ts";
import { workspaceMember } from "#api/middlewares/workspace-member.ts";
import { RecurringBillRepository } from "#api/routes/recurring-bills/repository.ts";
import {
	InsertRecurringBillSchema,
	RecurringBillSchema,
	RecurringBillsSchema,
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
			const { amount, currency, ...rest } = payload;
			const realAmount = monetary.toRealAmount(amount, currency);

			const bill = await repository.insert({
				id: generateId({ use: "uuid" }),
				...rest,
				amount: `${realAmount}`,
				currency,
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

			const { amount, currency, ...rest } = payload;
			const resolvedCurrency = currency ?? existing.currency;
			const realAmount =
				amount !== undefined ? monetary.toRealAmount(amount, resolvedCurrency) : existing.amount;

			await repository.update({
				id: param.id,
				workspaceId: workspace.id,
				payload: {
					...rest,
					amount: `${realAmount}`,
					currency: resolvedCurrency,
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
	.patch(
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
			summary: "Archive a recurring bill",
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
	);

export default route;
