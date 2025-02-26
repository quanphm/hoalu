import { generateId } from "@hoalu/common/generate-id";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { type } from "arktype";
import { and, eq, sql } from "drizzle-orm";
import { describeRoute } from "hono-openapi";
import { validator as aValidator } from "hono-openapi/arktype";
import { db, schema } from "../../db";
import { createHonoInstance } from "../../lib/create-app";
import { workspaceMember } from "../../middlewares/workspace-member";
import { idParamValidator } from "../../validators/id-param";
import { workspaceQueryValidator } from "../../validators/workspace-query";
import { insertTaskSchema, taskSchema, tasksSchema, updateTaskSchema } from "./schema";

const app = createHonoInstance();

const route = app
	.get(
		"/",
		describeRoute({
			tags: ["Tasks"],
			summary: "Get all tasks",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: tasksSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");

			const tasks = await db.query.task.findMany({
				where: (table, { eq }) => eq(table.workspaceId, workspace.id),
				orderBy: (table, { desc }) => desc(table.createdAt),
			});

			const parsed = tasksSchema(tasks);
			if (parsed instanceof type.errors) {
				return c.json(
					{ message: createIssueMsg(parsed.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed }, HTTPStatus.codes.OK);
		},
	)
	.get(
		"/:id",
		describeRoute({
			tags: ["Tasks"],
			summary: "Get a single task",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: taskSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const task = await db.query.task.findFirst({
				where: (table, { and, eq }) =>
					and(eq(table.workspaceId, workspace.id), eq(table.id, param.id)),
			});
			if (!task) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}

			const parsed = taskSchema(task);
			if (parsed instanceof type.errors) {
				return c.json(
					{ message: createIssueMsg(parsed.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed }, HTTPStatus.codes.OK);
		},
	)
	.post(
		"/",
		describeRoute({
			tags: ["Tasks"],
			summary: "Create a new task",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: taskSchema }), HTTPStatus.codes.CREATED),
			},
		}),
		aValidator("json", insertTaskSchema, (result, c) => {
			if (!result.success) {
				return c.json(
					{ message: createIssueMsg(result.errors.issues) },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const user = c.get("user")!;
			const workspace = c.get("workspace");
			const payload = c.req.valid("json");

			const [taskResult] = await db
				.insert(schema.task)
				.values({
					id: generateId({ use: "uuid" }),
					creatorId: user.id,
					workspaceId: workspace.id,
					...payload,
				})
				.returning();

			const parsed = taskSchema(taskResult);
			if (parsed instanceof type.errors) {
				return c.json(
					{ message: createIssueMsg(parsed.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed }, HTTPStatus.codes.CREATED);
		},
	)
	.patch(
		"/:id",
		describeRoute({
			tags: ["Tasks"],
			summary: "Update a task",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: taskSchema }), HTTPStatus.codes.OK),
			},
		}),
		aValidator("json", updateTaskSchema, (result, c) => {
			if (!result.success) {
				return c.json(
					{ message: createIssueMsg(result.errors.issues) },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");
			const payload = c.req.valid("json");

			const [queryData] = await db
				.update(schema.task)
				.set({
					updatedAt: sql`now()`,
					...payload,
				})
				.where(and(eq(schema.task.id, param.id), eq(schema.task.workspaceId, workspace.id)))
				.returning();

			if (!queryData) {
				return c.json({ message: "Update operation failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = taskSchema(queryData);
			if (parsed instanceof type.errors) {
				return c.json(
					{ message: createIssueMsg(parsed.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed }, HTTPStatus.codes.OK);
		},
	)
	.delete(
		"/:id",
		describeRoute({
			tags: ["Tasks"],
			summary: "Delete a task",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: taskSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const [queryData] = await db
				.delete(schema.task)
				.where(and(eq(schema.task.id, param.id), eq(schema.task.workspaceId, workspace.id)))
				.returning();

			if (!queryData) {
				return c.json({ data: null }, HTTPStatus.codes.OK);
			}

			const parsed = taskSchema(queryData);
			if (parsed instanceof type.errors) {
				return c.json(
					{ message: createIssueMsg(parsed.issues) },
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json({ data: parsed }, HTTPStatus.codes.OK);
		},
	);

export default route;
