import { monetary } from "@hoalu/finance/monetary";
import { OpenAPI } from "@hoalu/furnace";
import { HTTPStatus } from "@hoalu/http/http-status";
import { createIssueMsg } from "@hoalu/http/standard-validate";
import { generateId } from "@hoalu/ids/generate-id";
import { tryCatch } from "@hoalu/stdlib/try-catch";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import * as z from "zod";

import { db } from "#api/db/index.ts";
import { createHonoInstance } from "#api/lib/create-app.ts";
import { currentXactId } from "#api/lib/xact-id.ts";
import { workspaceMember } from "#api/middlewares/workspace-member.ts";
import { IncomeRepository } from "#api/routes/incomes/repository.ts";
import {
	DeleteIncomeSchema,
	IncomeSchema,
	IncomesSchema,
	InsertIncomeSchema,
	LiteIncomeSchema,
	UpdateIncomeSchema,
} from "#api/routes/incomes/schema.ts";
import { idParamValidator } from "#api/validators/id-param.ts";
import { jsonBodyValidator } from "#api/validators/json-body.ts";
import { workspaceQueryValidator } from "#api/validators/workspace-query.ts";

const app = createHonoInstance();
const incomeRepository = new IncomeRepository();
const TAGS = ["Incomes"];

const route = app
	.get(
		"/",
		describeRoute({
			tags: TAGS,
			summary: "Get all incomes",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: IncomesSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");

			const incomes = await incomeRepository.findAllByWorkspaceId({
				workspaceId: workspace.id,
			});

			const parsed = IncomesSchema.safeParse(incomes);
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
		"/:id",
		describeRoute({
			tags: TAGS,
			summary: "Get a single income",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: IncomeSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const income = await incomeRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});
			if (!income) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const parsed = IncomeSchema.safeParse(income);
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
			summary: "Create a new income",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: LiteIncomeSchema }), HTTPStatus.codes.CREATED),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(InsertIncomeSchema),
		async (c) => {
			const user = c.get("user");
			if (!user) {
				throw new HTTPException(HTTPStatus.codes.UNAUTHORIZED, {
					message: HTTPStatus.phrases.UNAUTHORIZED,
				});
			}
			const workspace = c.get("workspace");
			const payload = c.req.valid("json");

			const { amount, currency, date, id, publicId, ...rest } = payload;
			const realAmount = monetary.toRealAmount(amount, currency);
			const incomeDate = date || new Date().toISOString();
			const incomeId = id ?? generateId({ use: "uuid" });

			const result = await tryCatch.async(
				db.transaction(async (tx) => {
					await incomeRepository.insert(
						{
							...rest,
							id: incomeId,
							publicId: publicId ?? generateId({ use: "nanoid", kind: "income" }),
							workspaceId: workspace.id,
							creatorId: user.id,
							date: incomeDate,
							amount: `${realAmount}`,
							currency,
						},
						tx,
					);

					const row = await incomeRepository.findOne(
						{ id: incomeId, workspaceId: workspace.id },
						tx,
					);

					return { row, txid: await currentXactId(tx) };
				}),
			);

			if (result.error) {
				return c.json({ message: "Create failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const income = result.data.row;
			if (!income) {
				return c.json({ message: "Create failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = LiteIncomeSchema.safeParse({ ...income, txid: result.data.txid });
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
			summary: "Update an income",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: LiteIncomeSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(UpdateIncomeSchema),
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");
			const payload = c.req.valid("json");

			const existing = await incomeRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});
			if (!existing) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const { amount, currency, date, title, description, walletId, categoryId } = payload;
			const resolvedCurrency = currency ?? existing.currency;
			const realAmount =
				amount !== undefined ? monetary.toRealAmount(amount, resolvedCurrency) : existing.amount;

			// Build the update set — only include fields that were explicitly provided
			const updateSet: Record<string, unknown> = {
				amount: `${realAmount}`,
				currency: resolvedCurrency,
			};
			if (title !== undefined) updateSet.title = title;
			if (description !== undefined) updateSet.description = description;
			if (date !== undefined) updateSet.date = date;
			if (walletId !== undefined) updateSet.walletId = walletId;
			if (categoryId !== undefined) updateSet.categoryId = categoryId;

			const result = await tryCatch.async(
				db.transaction(async (tx) => {
					const updated = await incomeRepository.update(
						{
							id: param.id,
							workspaceId: workspace.id,
							payload: updateSet,
						},
						tx,
					);

					return { updated, txid: await currentXactId(tx) };
				}),
			);

			if (result.error || !result.data.updated) {
				return c.json({ message: "Update failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			// Fetch the full record with joins for the response
			const income = await incomeRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});

			if (!income) {
				return c.json({ message: "Update failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = LiteIncomeSchema.safeParse({ ...income, txid: result.data.txid });
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	)
	.delete(
		"/:id",
		describeRoute({
			tags: TAGS,
			summary: "Delete an income",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: DeleteIncomeSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const result = await tryCatch.async(
				db.transaction(async (tx) => {
					await incomeRepository.delete({ id: param.id, workspaceId: workspace.id }, tx);
					return currentXactId(tx);
				}),
			);

			if (result.error) {
				return c.json({ message: "Delete failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = DeleteIncomeSchema.safeParse({ id: param.id, txid: result.data });
			if (!parsed.success) {
				return c.json(
					{ message: createIssueMsg(parsed.error.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed.data }, HTTPStatus.codes.OK);
		},
	);

export default route;
