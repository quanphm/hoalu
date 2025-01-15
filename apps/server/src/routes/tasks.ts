import { db } from "@/db";
import { task } from "@/db/schema/task";
import { createHonoInstance } from "@/lib/create-app";
import { reduceValibotIssues } from "@woben/common/validate-env";
import {
	StatusCodes,
	StatusPhrases,
	openAPIContent,
	openAPIUnauthorized,
} from "@woben/furnace/utils";
import { createInsertSchema, createSelectSchema } from "drizzle-valibot";
import { describeRoute } from "hono-openapi";
import { validator as vValidator } from "hono-openapi/valibot";
import { cors } from "hono/cors";
import * as v from "valibot";

const app = createHonoInstance();

app.use(cors());

const selectSchema = v.omit(createSelectSchema(task), ["userId", "createdAt", "updatedAt"]);
const insertSchema = v.omit(
	createInsertSchema(task, {
		name: (schema) => v.pipe(schema, v.nonEmpty()),
		done: (schema) => v.optional(schema, false),
	}),
	["userId"],
);

export const tasksRoute = app
	.get(
		"/",
		describeRoute({
			tags: ["tasks"],
			description: "Retrieve all tasks",
			responses: {
				...openAPIUnauthorized(),
				[StatusCodes.UNPROCESSABLE_ENTITY]: openAPIContent(
					v.object({
						error: v.array(
							v.object({
								attribute: v.undefinedable(v.string()),
								message: v.string(),
							}),
						),
					}),
					"Validation errors",
				),
				[StatusCodes.OK]: openAPIContent(
					v.object({
						data: v.array(selectSchema),
					}),
					StatusPhrases.OK,
				),
			},
		}),
		async (c) => {
			const user = c.get("user")!;
			const tasks = await db.query.task.findMany({
				where: (task, { eq }) => eq(task.userId, user.id),
			});

			const parsed = v.safeParse(v.array(selectSchema), tasks);

			if (!parsed.success) {
				return c.json(
					{
						error: reduceValibotIssues(parsed.issues),
					},
					StatusCodes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json(
				{
					data: parsed.output,
				},
				StatusCodes.OK,
			);
		},
	)
	.post(
		"/",
		describeRoute({
			tags: ["tasks"],
			description: "Create new task",
			responses: {
				...openAPIUnauthorized(),
				[StatusCodes.BAD_REQUEST]: openAPIContent(
					v.object({
						error: v.array(
							v.object({
								attribute: v.undefinedable(v.string()),
								message: v.string(),
							}),
						),
					}),
					"Invalid request body",
				),
				[StatusCodes.UNPROCESSABLE_ENTITY]: openAPIContent(
					v.object({
						error: v.array(
							v.object({
								attribute: v.undefinedable(v.string()),
								message: v.string(),
							}),
						),
					}),
					"Validation errors",
				),
				[StatusCodes.CREATED]: openAPIContent(
					v.object({
						data: insertSchema,
					}),
					StatusPhrases.CREATED,
				),
			},
		}),
		vValidator("json", insertSchema, (result, c) => {
			if (!result.success) {
				return c.json(
					{
						error: reduceValibotIssues(result.issues),
					},
					StatusCodes.BAD_REQUEST,
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
					userId: user.id,
				})
				.returning();

			const parsed = v.safeParse(selectSchema, result);

			if (!parsed.success) {
				return c.json(
					{
						error: reduceValibotIssues(parsed.issues),
					},
					StatusCodes.UNPROCESSABLE_ENTITY,
				);
			}

			return c.json(
				{
					data: parsed.output,
				},
				StatusCodes.CREATED,
			);
		},
	);
