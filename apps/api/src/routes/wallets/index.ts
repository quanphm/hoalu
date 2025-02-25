import { generateId } from "@hoalu/common/generate-id";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { type } from "arktype";
import { and, desc, eq } from "drizzle-orm";
import { describeRoute } from "hono-openapi";
import { validator as aValidator } from "hono-openapi/arktype";
import { db } from "../../db";
import { user } from "../../db/schema/auth";
import { wallet } from "../../db/schema/finance";
import { workspace } from "../../db/schema/workspace";
import { createHonoInstance } from "../../lib/create-app";
import { workspaceMember } from "../../middlewares/workspace-member";
import { idParamValidator } from "../../validators/id-param";
import { workspaceQueryValidator } from "../../validators/workspace-query";
import { insertWalletSchema, walletSchema, walletsSchema } from "./schema";

const app = createHonoInstance();

const route = app
	.get(
		"/",
		describeRoute({
			tags: ["Wallets"],
			summary: "Get all wallets",
			description: "Get all workspace's wallets",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: walletsSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const currentWorkspace = c.get("workspace");

			const queryResult = await db
				.select()
				.from(wallet)
				.innerJoin(user, eq(wallet.ownerId, user.id))
				.innerJoin(workspace, eq(wallet.workspaceId, workspace.id))
				.where(eq(wallet.workspaceId, currentWorkspace.id))
				.orderBy(desc(wallet.createdAt));

			const wallets = queryResult.map((item) => ({
				...item.wallet,
				owner: item.user,
				workspace: item.workspace,
			}));

			const parsed = walletsSchema(wallets);
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
			tags: ["Wallets"],
			summary: "Get a single wallet",
			description: "Get a single workspaces's wallet",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: walletSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const { id } = c.req.valid("param");

			const wallet = await db.query.wallet.findFirst({
				where: (table, { and, eq }) => and(eq(table.workspaceId, workspace.id), eq(table.id, id)),
			});

			if (!wallet) {
				return c.json({ message: "Wallet not found" }, HTTPStatus.codes.NOT_FOUND);
			}

			const parsed = walletSchema(wallet);
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
			tags: ["Wallets"],
			summary: "Create a new wallet",
			description: "Create a new wallet",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: walletSchema }), HTTPStatus.codes.CREATED),
			},
		}),
		aValidator("json", insertWalletSchema, (result, c) => {
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

			const [result] = await db
				.insert(wallet)
				.values({
					id: generateId({ use: "uuid" }),
					ownerId: user.id,
					workspaceId: workspace.id,
					...payload,
				})
				.returning();

			const parsed = walletSchema(result);
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
			const { id } = c.req.valid("param");
			const { name, done, priority, dueDate } = c.req.valid("json");

			const [taskResult] = await db
				.update(task)
				.set({
					name,
					done,
					priority,
					dueDate,
					updatedAt: sql`now()`,
				})
				.where(and(eq(task.id, id), eq(task.workspaceId, workspace.id)))
				.returning();

			if (!taskResult) {
				return c.json({ message: "Task not found" }, HTTPStatus.codes.NOT_FOUND);
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
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const user = c.get("user")!;
			const workspace = c.get("workspace");
			const { id } = c.req.valid("param");

			const [deletedTask] = await db
				.delete(task)
				.where(and(eq(task.id, id), eq(task.workspaceId, workspace.id)))
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
