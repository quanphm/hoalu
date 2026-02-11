import { createHonoInstance } from "#api/lib/create-app.ts";
import { prepareElectricUrl, proxyElectricRequest } from "#api/lib/electric.ts";
import { workspaceMember } from "#api/middlewares/workspace-member.ts";
import { workspaceQueryValidator } from "#api/validators/workspace-query.ts";
import { HTTPStatus } from "@hoalu/common/http-status";
import { authGuard } from "@hoalu/furnace";
import { cors } from "hono/cors";

export function syncModule() {
	const app = createHonoInstance()
		.basePath("/sync")
		.use(
			cors({
				origin: [process.env.PUBLIC_APP_BASE_URL],
				exposeHeaders: [
					"electric-cursor",
					"electric-handle",
					"electric-offset",
					"electric-schema",
					"electric-up-to-date",
				],
				credentials: true,
			}),
		)
		.use(authGuard())
		.get("/expenses", workspaceQueryValidator, workspaceMember, async (c) => {
			const workspace = c.get("workspace");
			const shapeUrl = prepareElectricUrl(c.req.url);
			const whereClause = `workspace_id = '${workspace.id}'`;

			shapeUrl.searchParams.set("table", "expense");
			shapeUrl.searchParams.set("where", whereClause);

			const [data, headers] = await proxyElectricRequest(shapeUrl);

			return c.json(data, HTTPStatus.codes.OK, headers.toJSON());
		})
		.get("/categories", workspaceQueryValidator, workspaceMember, async (c) => {
			const workspace = c.get("workspace");
			const shapeUrl = prepareElectricUrl(c.req.url);
			const whereClause = `workspace_id = '${workspace.id}'`;

			shapeUrl.searchParams.set("table", "category");
			shapeUrl.searchParams.set("where", whereClause);

			const [data, headers] = await proxyElectricRequest(shapeUrl);

			return c.json(data, HTTPStatus.codes.OK, headers.toJSON());
		})
		.get("/wallets", workspaceQueryValidator, workspaceMember, async (c) => {
			const workspace = c.get("workspace");
			const shapeUrl = prepareElectricUrl(c.req.url);
			const whereClause = `workspace_id = '${workspace.id}'`;

			shapeUrl.searchParams.set("table", "wallet");
			shapeUrl.searchParams.set("where", whereClause);

			const [data, headers] = await proxyElectricRequest(shapeUrl);

			return c.json(data, HTTPStatus.codes.OK, headers.toJSON());
		})
		.get("/exchange-rates", async (c) => {
			const shapeUrl = prepareElectricUrl(c.req.url);

			shapeUrl.searchParams.set("table", "fx_rate");

			const [data, headers] = await proxyElectricRequest(shapeUrl);

			return c.json(data, HTTPStatus.codes.OK, headers.toJSON());
		});

	return app;
}
