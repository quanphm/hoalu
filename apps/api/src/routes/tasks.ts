import { WORKSPACE_ERROR_CODES } from "@hoalu/auth/plugins";
import { generateId } from "@hoalu/common/generate-id";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createStandardIssues } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { type } from "arktype";
import { eq, sql } from "drizzle-orm";
import { describeRoute } from "hono-openapi";
import { validator as aValidator } from "hono-openapi/arktype";
import { db } from "../db";
import { task } from "../db/schema/task";
import { createHonoInstance } from "../lib/create-app";

const app = createHonoInstance();

const taskSchema = type({
	id: "string",
	name: "string",
	done: "boolean",
	creatorId: "string",
	workspaceId: "string",
	createdAt: "string",
	updatedAt: "string",
});
const tasksSchema = taskSchema.array();
const insertTaskSchema = type({
	name: "string > 0",
	done: "boolean = false",
});
const updateTaskSchema = type({
	id: "string",
	"name?": "string > 0",
	"done?": "boolean",
});
const querySchema = type({
	workspaceIdOrSlug: "string",
});

export const tasksRoute = app
	.get(
		"/",
		describeRoute({
			tags: ["Tasks"],
			summary: "Get all tasks",
			description: "Get all tasks related to the user",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: tasksSchema }), HTTPStatus.codes.OK),
			},
		}),
		aValidator("query", querySchema, (result, c) => {
			if (!result.success) {
				return c.json(
					{ message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}
		}),
		async (c) => {
			const { workspaceIdOrSlug } = c.req.valid("query");
			const workspaceResult = await db.query.workspace.findFirst({
				where: (workspace, { eq, or }) =>
					or(eq(workspace.slug, workspaceIdOrSlug), eq(workspace.publicId, workspaceIdOrSlug)),
			});
			if (!workspaceResult) {
				return c.json(
					{ message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}

			const tasks = await db.query.task.findMany({
				where: (task, { eq }) => eq(task.workspaceId, workspaceResult.id),
			});
			const parsed = tasksSchema(tasks);

			if (parsed instanceof type.errors) {
				return c.json(
					{
						message: createStandardIssues(parsed.issues)[0],
					},
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
			description: "Create a new task related to the user",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: insertTaskSchema }), HTTPStatus.codes.CREATED),
			},
		}),
		aValidator("query", querySchema, (result, c) => {
			if (!result.success) {
				return c.json(
					{
						message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
					},
					HTTPStatus.codes.BAD_REQUEST,
				);
			}
		}),
		aValidator("json", insertTaskSchema, (result, c) => {
			if (!result.success) {
				return c.json(
					{ message: createStandardIssues(result.errors.issues)[0] },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}
		}),
		async (c) => {
			const user = c.get("user")!;
			const { workspaceIdOrSlug } = c.req.valid("query");
			const { name, done } = c.req.valid("json");

			const currentWorkspace = await db.query.workspace.findFirst({
				where: (workspace, { eq, or }) =>
					or(eq(workspace.slug, workspaceIdOrSlug), eq(workspace.publicId, workspaceIdOrSlug)),
			});
			if (!currentWorkspace) {
				return c.json(
					{ message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}

			const [taskResult] = await db
				.insert(task)
				.values({
					id: generateId({ use: "uuid" }),
					name,
					done,
					creatorId: user.id,
					workspaceId: currentWorkspace.id,
				})
				.returning();

			const parsed = taskSchema(taskResult);

			if (parsed instanceof type.errors) {
				return c.json(
					{
						message: createStandardIssues(parsed.issues)[0],
					},
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}
			return c.json({ data: parsed }, HTTPStatus.codes.CREATED);
		},
	)
	.patch(
		"/",
		describeRoute({
			tags: ["Tasks"],
			summary: "Update a task",
			description: "Update content & status of a task related to the user",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: insertTaskSchema }), HTTPStatus.codes.OK),
			},
		}),
		aValidator("query", querySchema, (result, c) => {
			if (!result.success) {
				return c.json(
					{
						message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
					},
					HTTPStatus.codes.BAD_REQUEST,
				);
			}
		}),
		aValidator("json", updateTaskSchema, (result, c) => {
			if (!result.success) {
				return c.json(
					{ message: createStandardIssues(result.errors.issues)[0] },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}
		}),
		async (c) => {
			const { workspaceIdOrSlug } = c.req.valid("query");
			const { id, name, done } = c.req.valid("json");

			const currentWorkspace = await db.query.workspace.findFirst({
				where: (workspace, { eq, or }) =>
					or(eq(workspace.slug, workspaceIdOrSlug), eq(workspace.publicId, workspaceIdOrSlug)),
			});
			if (!currentWorkspace) {
				return c.json(
					{ message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}

			const currentTask = await db.query.task.findFirst({
				where: (task, { and, eq }) =>
					and(eq(task.id, id), eq(task.workspaceId, currentWorkspace.id)),
			});
			if (!currentTask) {
				return c.json({ message: "Task not found" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const [taskResult] = await db
				.update(task)
				.set({
					name,
					done,
					updatedAt: sql`now()`,
				})
				.where(eq(task.id, id))
				.returning();

			const parsed = taskSchema(taskResult);

			if (parsed instanceof type.errors) {
				return c.json(
					{
						message: createStandardIssues(parsed.issues)[0],
					},
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}
			return c.json({ data: parsed }, HTTPStatus.codes.OK);
		},
	);
