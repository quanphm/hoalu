import { createHonoInstance } from "#api/lib/create-app.ts";
import { workspaceMember } from "#api/middlewares/workspace-member.ts";
import { ExpenseRepository } from "#api/routes/expenses/repository.ts";
import {
	DeleteExpenseSchema,
	ExpenseSchema,
	ExpensesSchema,
	InsertExpenseSchema,
	LiteExpenseSchema,
	UpdateExpenseSchema,
} from "#api/routes/expenses/schema.ts";
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
const expenseRepository = new ExpenseRepository();
const TAGS = ["Expenses"];

const route = app
	.get(
		"/",
		describeRoute({
			tags: TAGS,
			summary: "Get all expenses",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: ExpensesSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");

			const expenses = await expenseRepository.findAllByWorkspaceId({
				workspaceId: workspace.id,
			});

			const parsed = ExpensesSchema.safeParse(expenses);
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
			summary: "Get a single expense",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: ExpenseSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const expense = await expenseRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});
			if (!expense) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const parsed = ExpenseSchema.safeParse(expense);
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
			summary: "Create a new expense",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: LiteExpenseSchema }), HTTPStatus.codes.CREATED),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(InsertExpenseSchema),
		async (c) => {
			const user = c.get("user");
			if (!user) {
				throw new HTTPException(HTTPStatus.codes.UNAUTHORIZED, {
					message: HTTPStatus.phrases.UNAUTHORIZED,
				});
			}
			const workspace = c.get("workspace");
			const payload = c.req.valid("json");

			const { amount, currency, date, ...rest } = payload;
			const realAmount = monetary.toRealAmount(amount, currency);

			const expense = await expenseRepository.insert({
				...rest,
				id: generateId({ use: "uuid" }),
				workspaceId: workspace.id,
				creatorId: user.id,
				date: date || new Date().toISOString(),
				amount: `${realAmount}`,
				currency,
			});
			if (!expense) {
				return c.json({ message: "Create failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = LiteExpenseSchema.safeParse(expense);
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
			summary: "Update a expense",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: LiteExpenseSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(UpdateExpenseSchema),
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");
			const payload = c.req.valid("json");

			const expense = await expenseRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});
			if (!expense) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const { amount, currency } = payload;
			const realAmount = monetary.toRealAmount(
				amount ?? Number.parseFloat(expense.amount),
				currency ?? expense.currency,
			);

			const queryData = await expenseRepository.update({
				id: param.id,
				workspaceId: workspace.id,
				payload: {
					...payload,
					amount: `${realAmount}`,
				},
			});
			if (!queryData) {
				return c.json({ message: "Update failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = LiteExpenseSchema.safeParse(queryData);
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
			summary: "Delete a expense",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(z.object({ data: DeleteExpenseSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const expense = await expenseRepository.delete({
				id: param.id,
				workspaceId: workspace.id,
			});

			const parsed = DeleteExpenseSchema.safeParse(expense);
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
