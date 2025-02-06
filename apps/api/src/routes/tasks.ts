import { WORKSPACE_ERROR_CODES } from "@hoalu/auth/plugins";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createStandardIssues } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { type } from "arktype";
import { describeRoute } from "hono-openapi";
import { validator as aValidator } from "hono-openapi/arktype";
import { cors } from "hono/cors";
import { db } from "../db";
import { task } from "../db/schema/task";
import { workspace } from "../db/schema/workspace";
import { createHonoInstance } from "../lib/create-app";

const app = createHonoInstance();
app.use(cors());

const taskSchema = type({
	id: "number",
	name: "string",
	done: "boolean",
	creatorId: "number",
	workspaceId: "number",
	createdAt: "string",
	updatedAt: "string",
});
const tasksSchema = taskSchema.array();
const insertTaskSchema = type({
	name: "string > 0",
	done: "boolean = false",
});
const querySchema = type({
	workspaceIdSlug: "string",
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
					{ error: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}
		}),
		async (c) => {
			const { workspaceIdSlug } = c.req.valid("query");
			const workspaceResult = await db.query.workspace.findFirst({
				where: (workspace, { eq, or }) =>
					or(eq(workspace.slug, workspaceIdSlug), eq(workspace.publicId, workspaceIdSlug)),
			});
			if (!workspaceResult) {
				return c.json(
					{ error: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND },
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
						error: createStandardIssues(parsed.issues),
					},
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}
			return c.json(
				{
					data: parsed,
				},
				HTTPStatus.codes.OK,
			);
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
					{ error: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}
		}),
		aValidator("json", insertTaskSchema, (result, c) => {
			if (!result.success) {
				return c.json(
					{ error: createStandardIssues(result.errors.issues) },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}
		}),
		async (c) => {
			const user = c.get("user")!;
			const { workspaceIdSlug } = c.req.valid("query");
			const { name, done } = c.req.valid("json");

			const workspaceResult = await db.query.workspace.findFirst({
				where: (workspace, { eq, or }) =>
					or(eq(workspace.slug, workspaceIdSlug), eq(workspace.publicId, workspaceIdSlug)),
			});
			if (!workspaceResult) {
				return c.json(
					{ error: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}

			const [taskResult] = await db
				.insert(task)
				.values({
					name,
					done,
					creatorId: user.id,
					workspaceId: workspaceResult.id,
				})
				.returning();

			const parsed = taskSchema(taskResult);

			if (parsed instanceof type.errors) {
				return c.json(
					{
						error: createStandardIssues(parsed.issues),
					},
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}
			return c.json(
				{
					data: parsed,
				},
				HTTPStatus.codes.CREATED,
			);
		},
	);
