import { WORKSPACE_ERROR_CODES } from "@hoalu/auth/plugins";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { type } from "arktype";
import { describeRoute } from "hono-openapi";
import { db } from "../../db";
import { createHonoInstance } from "../../lib/create-app";
import { workspaceMember } from "../../middlewares/workspace-member";
import { workspaceQueryValidator } from "../../validators/workspace-query";

const walletSchema = type({
	id: "string",
	name: "string",
	description: "string",
	currency: "string",
	type: "string",
	ownerId: "string",
	workspaceId: "string",
	createdAt: "string",
	updatedAt: "string",
});
const walletsSchema = walletSchema.array();

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
		const user = c.get("user")!;
		const workspace = c.get("workspace");

		const wallets = await db.query.wallet.findMany({
			where: (table, { eq }) => eq(table.workspaceId, workspace.id),
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
);

export default route;
