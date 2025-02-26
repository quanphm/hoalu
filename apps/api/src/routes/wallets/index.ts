import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { type } from "arktype";
import { describeRoute } from "hono-openapi";
import { validator as aValidator } from "hono-openapi/arktype";
import { db } from "../../db";
import { createHonoInstance } from "../../lib/create-app";
import { workspaceMember } from "../../middlewares/workspace-member";
import { idParamValidator } from "../../validators/id-param";
import { workspaceQueryValidator } from "../../validators/workspace-query";
import { WalletRepository } from "./repository";
import { insertWalletSchema, updateWalletSchema, walletSchema, walletsSchema } from "./schema";

const app = createHonoInstance();
const walletRepository = new WalletRepository();

const route = app
	.get(
		"/",
		describeRoute({
			tags: ["Wallets"],
			summary: "Get all wallets",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: walletsSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const wallets = await walletRepository.findAllByWorkspaceId({
				workspaceId: workspace.id,
			});

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
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: walletSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const wallet = await walletRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});
			if (!wallet) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
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

			const wallet = await walletRepository.insert({
				ownerId: user.id,
				workspaceId: workspace.id,
				...payload,
			});

			const parsed = walletSchema(wallet);
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
			tags: ["Wallets"],
			summary: "Update a wallet",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: walletSchema }), HTTPStatus.codes.OK),
			},
		}),
		aValidator("json", updateWalletSchema, (result, c) => {
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
			const user = c.get("user")!;
			const workspace = c.get("workspace");
			const param = c.req.valid("param");
			const payload = c.req.valid("json");

			const wallet = await walletRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});
			if (!wallet) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}
			if (wallet.owner.id !== user.id) {
				return c.json(
					{ message: "You are not the owner of this wallet" },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}

			const queryData = await walletRepository.update({
				id: wallet.id,
				workspaceId: workspace.id,
				payload,
			});
			if (!queryData) {
				return c.json({ message: "Update operation failed" }, HTTPStatus.codes.BAD_REQUEST);
			}

			const parsed = walletSchema(queryData);
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
			tags: ["Wallets"],
			summary: "Delete a wallet",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: walletSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const user = c.get("user")!;
			const workspace = c.get("workspace");
			const param = c.req.valid("param");

			const wallet = await db.query.wallet.findFirst({
				where: (table, { and, eq }) =>
					and(eq(table.id, param.id), eq(table.workspaceId, workspace.id)),
			});
			if (!wallet) {
				return c.json({ data: null }, HTTPStatus.codes.OK);
			}
			if (wallet.ownerId !== user.id) {
				return c.json(
					{ message: "You are not the owner of this wallet" },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}

			const queryData = await walletRepository.delete({
				id: wallet.id,
				workspaceId: workspace.id,
			});
			if (!queryData) {
				return c.json({ data: null }, HTTPStatus.codes.OK);
			}

			const parsed = walletSchema(queryData);
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
