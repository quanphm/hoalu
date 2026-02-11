import { createHonoInstance } from "#api/lib/create-app.ts";
import { WorkspaceRepository } from "#api/routes/workspaces/repository.ts";
import { WorkspaceSummariesSchema, WorkspaceSummarySchema } from "#api/routes/workspaces/schema.ts";
import { idParamValidator } from "#api/validators/id-param.ts";
import { HTTPStatus } from "@hoalu/common/http-status";
import { OpenAPI } from "@hoalu/furnace";
import { describeRoute } from "hono-openapi";
import { HTTPException } from "hono/http-exception";
import * as z from "zod";

const app = createHonoInstance();
const workspaceRepository = new WorkspaceRepository();
const TAGS = ["Workspaces"];

const route = app
	.get(
		"/:id/summary",
		describeRoute({
			tags: TAGS,
			summary: "Get workspace summary with financial metrics",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.not_found(),
				...OpenAPI.response(z.object({ data: WorkspaceSummarySchema }), HTTPStatus.codes.OK),
			},
		}),
		idParamValidator,
		async (c) => {
			const session = c.get("session");
			if (!session) {
				throw new HTTPException(HTTPStatus.codes.UNAUTHORIZED, {
					message: "Unauthorized",
				});
			}

			const { id } = c.req.valid("param");

			const summary = await workspaceRepository.getWorkspaceSummary({
				workspaceId: id,
				userId: session.userId,
			});

			if (!summary) {
				throw new HTTPException(HTTPStatus.codes.NOT_FOUND, {
					message: "Workspace not found or you don't have access",
				});
			}

			return c.json({ data: summary }, HTTPStatus.codes.OK);
		},
	)
	.get(
		"/summaries",
		describeRoute({
			tags: TAGS,
			summary: "Get all workspace summaries for current user",
			responses: {
				...OpenAPI.unauthorized(),
				...OpenAPI.response(z.object({ data: WorkspaceSummariesSchema }), HTTPStatus.codes.OK),
			},
		}),
		async (c) => {
			const session = c.get("session");
			if (!session) {
				throw new HTTPException(HTTPStatus.codes.UNAUTHORIZED, {
					message: "Unauthorized",
				});
			}

			const summaries = await workspaceRepository.getAllWorkspaceSummaries({
				userId: session.userId,
			});

			return c.json({ data: summaries }, HTTPStatus.codes.OK);
		},
	);

export default route;
