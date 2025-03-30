import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { type } from "arktype";
import { describeRoute } from "hono-openapi";
import { WORKSPACE_CREATOR_ROLE } from "../../common/constants";
import { createHonoInstance } from "../../lib/create-app";
import { workspaceMember } from "../../middlewares/workspace-member";
import { idParamValidator } from "../../validators/id-param";
import { jsonBodyValidator } from "../../validators/json-body";
import { workspaceQueryValidator } from "../../validators/workspace-query";
import { WalletRepository } from "./repository";
import {
	DeletetWalletSchema,
	InsertWalletSchema,
	UpdateWalletSchema,
	WalletSchema,
	WalletsSchema,
} from "./schema";

const app = createHonoInstance();
const walletRepository = new WalletRepository();
const TAGS = ["Wallets"];

const route = app
	.get(
		"/",
		describeRoute({
			tags: TAGS,
			summary: "Get all wallets",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: WalletsSchema }), HTTPStatus.codes.OK),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const workspace = c.get("workspace");

			const wallets = await walletRepository.findAllByWorkspaceId({
				workspaceId: workspace.id,
			});

			const parsed = WalletsSchema(wallets);
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
			tags: TAGS,
			summary: "Get a single wallet",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: WalletSchema }), HTTPStatus.codes.OK),
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

			const parsed = WalletSchema(wallet);
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
			tags: TAGS,
			summary: "Create a new wallet",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: WalletSchema }), HTTPStatus.codes.CREATED),
			},
		}),
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(InsertWalletSchema),
		async (c) => {
			const user = c.get("user")!;
			const workspace = c.get("workspace");
			const payload = c.req.valid("json");

			const wallet = await walletRepository.insert({
				ownerId: user.id,
				workspaceId: workspace.id,
				...payload,
			});

			const parsed = WalletSchema(wallet);
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
			tags: TAGS,
			summary: "Update a wallet",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.not_found(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: WalletSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		jsonBodyValidator(UpdateWalletSchema),
		async (c) => {
			const user = c.get("user")!;
			const workspace = c.get("workspace");
			const membership = c.get("member");
			const param = c.req.valid("param");
			const payload = c.req.valid("json");

			// only owner can update their wallet
			const wallet = await walletRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});
			if (!wallet) {
				return c.json({ message: HTTPStatus.phrases.NOT_FOUND }, HTTPStatus.codes.NOT_FOUND);
			}
			if (wallet.owner.id !== user.id && membership.role !== WORKSPACE_CREATOR_ROLE) {
				return c.json(
					{ message: "You don't have permission to update this wallet" },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}

			// workspace must has atleast 1 active wallet
			// Prevent deactivate the last available wallet
			const wallets = await walletRepository.findAllByWorkspaceId({
				workspaceId: workspace.id,
			});
			const activeWallets = wallets.filter((w) => w.isActive);
			if (activeWallets.length === 1 && payload.isActive === false) {
				return c.json(
					{ message: "This wallet cannot be deactivated because it's your only available wallet" },
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

			const parsed = WalletSchema(queryData);
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
			tags: TAGS,
			summary: "Delete a wallet",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.bad_request(),
				...OpenAPI.server_parse_error(),
				...OpenAPI.response(type({ data: DeletetWalletSchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		workspaceQueryValidator,
		workspaceMember,
		async (c) => {
			const user = c.get("user")!;
			const workspace = c.get("workspace");
			const membership = c.get("member");
			const param = c.req.valid("param");

			// owner or workspace owener can delete their wallet
			const wallet = await walletRepository.findOne({
				id: param.id,
				workspaceId: workspace.id,
			});
			if (!wallet) {
				return c.json({ data: null }, HTTPStatus.codes.OK);
			}
			if (wallet.owner.id !== user.id && membership.role !== WORKSPACE_CREATOR_ROLE) {
				return c.json(
					{ message: "You don't have permission to delete this wallet" },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}

			// workspace must has atleast 1 active wallet
			// Prevent deactivate the last available wallet
			const wallets = await walletRepository.findAllByWorkspaceId({
				workspaceId: workspace.id,
			});
			const activeWallets = wallets.filter((w) => w.isActive);
			if (activeWallets.length === 1 && wallet.isActive) {
				return c.json(
					{ message: "This wallet cannot be deleted because it's your only available wallet" },
					HTTPStatus.codes.BAD_REQUEST,
				);
			}

			const queryData = await walletRepository.delete({
				id: wallet.id,
				workspaceId: workspace.id,
			});

			const parsed = DeletetWalletSchema(queryData);
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
