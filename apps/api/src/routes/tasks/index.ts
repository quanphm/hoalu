import { WORKSPACE_ERROR_CODES } from "@hoalu/auth/plugins";
import { generateId } from "@hoalu/common/generate-id";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { type } from "arktype";
import { and, eq, sql } from "drizzle-orm";
import { describeRoute } from "hono-openapi";
import { validator as aValidator } from "hono-openapi/arktype";
import { db } from "../../db";
import { task } from "../../db/schema/task";
import { createHonoInstance } from "../../lib/create-app";
import { workspaceMember } from "../../middlewares/workspace-member";
import { workspaceQueryValidator } from "../../validators/workspace-query";
import {
	insertTaskSchema,
	taskIdSchema,
	taskSchema,
	tasksSchema,
	updateTaskSchema,
} from "./schema";

const app = createHonoInstance();

const route = app
	.get(
		"/",
		describeRoute({
			tags: ["Tasks"],
			summary: "Get all tasks",
			description: "Get all workspaces's tasks",
			responses: {
				...OpenAPI.unauthorized(),
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
	.post(
		"/",
		describeRoute({
			tags: ["Tasks"],
			summary: "Create a task",
			description: "Create a new task",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: insertTaskSchema }), HTTPStatus.codes.CREATED),
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
			const { name, done } = c.req.valid("json");
			const user = c.get("user")!;
			const workspace = c.get("workspace");

			const [taskResult] = await db
				.insert(task)
				.values({
					id: generateId({ use: "uuid" }),
					name,
					done,
					creatorId: user.id,
					workspaceId: workspace.id,
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
			description: "Update content & status of a task",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: insertTaskSchema }), HTTPStatus.codes.OK),
			},
		}),
		aValidator("param", taskIdSchema, (result, c) => {
			if (!result.success) {
				return c.json({ message: "Invalid task id" }, HTTPStatus.codes.BAD_REQUEST);
			}
		}),
		aValidator("json", updateTaskSchema, (result, c) => {
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
			const { id } = c.req.valid("param");
			const { name, done } = c.req.valid("json");
			const workspace = c.get("workspace");

			const [taskResult] = await db
				.update(task)
				.set({
					name,
					done,
					updatedAt: sql`now()`,
				})
				.where(and(eq(task.id, id), eq(task.workspaceId, workspace.id)))
				.returning();

			if (!taskResult) {
				return c.json({ message: "Task not found" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = taskSchema(taskResult);
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
			description: "Detele a task",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: insertTaskSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		async (c) => {
			const user = c.get("user")!;
			const { id } = c.req.param();
			const { workspaceIdOrSlug } = c.req.valid("query");

			const currentWorkspace = await db.query.workspace.findFirst({
				where: (table, { eq, or }) =>
					or(eq(table.slug, workspaceIdOrSlug), eq(table.publicId, workspaceIdOrSlug)),
			});
			if (!currentWorkspace) {
				return c.json(
					{ message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}

			const memberResult = await db.query.member.findFirst({
				where: (table, { eq, and }) =>
					and(eq(table.workspaceId, currentWorkspace.id), eq(table.userId, user.id)),
			});
			if (!memberResult) {
				return c.json(
					{ message: WORKSPACE_ERROR_CODES.MEMBER_NOT_FOUND },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}

			const [deletedTask] = await db
				.delete(task)
				.where(and(eq(task.id, id), eq(task.workspaceId, currentWorkspace.id)))
				.returning();

			if (!deletedTask) {
				return c.json({ data: null }, HTTPStatus.codes.OK);
			}

			const parsed = taskSchema(deletedTask);
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
