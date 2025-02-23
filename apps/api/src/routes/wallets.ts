import { WORKSPACE_ERROR_CODES } from "@hoalu/auth/plugins";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createStandardIssues } from "@hoalu/common/standard-validate";
import { OpenAPI } from "@hoalu/furnace";
import { type } from "arktype";
import { describeRoute } from "hono-openapi";
import { validator as aValidator } from "hono-openapi/arktype";
import { db } from "../db";
import { workspaceQueryValidator } from "../helpers/validators";
import { createHonoInstance } from "../lib/create-app";

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
	async (c) => {
		const user = c.get("user")!;
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

		const member = await db.query.member.findFirst({
			where: (table, { eq, and }) =>
				and(eq(table.workspaceId, currentWorkspace.id), eq(table.userId, user.id)),
		});
		if (!member) {
			return c.json(
				{ message: WORKSPACE_ERROR_CODES.MEMBER_NOT_FOUND },
				HTTPStatus.codes.BAD_REQUEST,
			);
		}

		const wallets = await db.query.wallet.findMany({
			where: (table, { eq }) => eq(table.workspaceId, currentWorkspace.id),
		});

		const parsed = walletsSchema(wallets);
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

export default route;
