import { WORKSPACE_ERROR_CODES } from "@hoalu/auth/plugins";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { type } from "arktype";
import { and, eq } from "drizzle-orm";
import { describeRoute } from "hono-openapi";
import { db } from "../../db";
import { user } from "../../db/schema/auth";
import { wallet } from "../../db/schema/finance";
import { workspace } from "../../db/schema/workspace";
import { createHonoInstance } from "../../lib/create-app";
import { workspaceMember } from "../../middlewares/workspace-member";
import { workspaceQueryValidator } from "../../validators/workspace-query";
import { walletsSchema } from "./schema";

const app = createHonoInstance();

const route = app.get(
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
			.orderBy(wallet.createdAt);

		const wallets = queryResult.map((item) => ({
			...item.wallet,
			owner: item.user,
			workspace: item.workspace,
		}));

		console.log(wallets);
		const parsed = walletsSchema(wallets);
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
