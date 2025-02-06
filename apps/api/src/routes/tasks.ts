import { HTTPStatus } from "@hoalu/common/http-status";
import { createStandardIssues } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import { describeRoute } from "hono-openapi";
import { validator as vValidator } from "hono-openapi/valibot";
import { cors } from "hono/cors";
import * as v from "valibot";
import { db } from "../db";
import { task } from "../db/schema/task";
import { createHonoInstance } from "../lib/create-app";

const app = createHonoInstance();

app.use(cors());

const selectSchema = createSelectSchema(task);
const insertSchema = createInsertSchema(task, {
	name: (schema) => v.pipe(schema, v.nonEmpty()),
	done: (schema) => v.optional(schema, false),
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
				...OpenAPI.response(v.object({ data: v.array(selectSchema) }), HTTPStatus.codes.OK),
			},
		}),
		async (c) => {
			const user = c.get("user")!;
			const tasks = await db.query.task.findMany({
				where: (task, { eq }) => eq(task.creatorId, user.id),
			});

			const parsed = v.safeParse(v.array(selectSchema), tasks);

			if (!parsed.success) {
				return c.json(
					{
						error: createStandardIssues(parsed.issues),
					},
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json(
				{
					data: parsed.output,
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
				...OpenAPI.response(v.object({ data: insertSchema }), HTTPStatus.codes.CREATED),
			},
		}),
		vValidator("json", insertSchema, (result, c) => {
			if (!result.success) {
				return c.json(
					{
						error: createStandardIssues(result.issues),
					},
					HTTPStatus.codes.BAD_REQUEST,
				);
			}
		}),
		async (c) => {
			const user = c.get("user")!;
			const { name, done } = c.req.valid("json");

			const [result] = await db
				.insert(task)
				.values({
					name,
					done,
					creatorId: user.id,
				})
				.returning();

			const parsed = v.safeParse(selectSchema, result);

			if (!parsed.success) {
				return c.json(
					{
						error: createStandardIssues(parsed.issues),
					},
					HTTPStatus.codes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json(
				{
					data: parsed.output,
				},
				HTTPStatus.codes.CREATED,
			);
		},
	);
