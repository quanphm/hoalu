import { authGuard } from "@hoalu/furnace";
import { HTTPStatus } from "@hoalu/http/http-status";
import { cors } from "hono/cors";

import { createHonoInstance } from "#api/lib/create-app.ts";
import { prepareElectricUrl, proxyElectricRequest } from "#api/lib/electric.ts";
import { workspaceMember } from "#api/middlewares/workspace-member.ts";
import { workspaceQueryValidator } from "#api/validators/workspace-query.ts";

function headersToRecord(headers: Headers): Record<string, string> {
	const record: Record<string, string> = {};
	headers.forEach((value, key) => {
		record[key] = value;
	});
	return record;
}

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
					"electric-has-data",
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

			const response = await proxyElectricRequest(shapeUrl);

			return c.json(await response.json(), HTTPStatus.codes.OK, headersToRecord(response.headers));
		})
		.get("/categories", workspaceQueryValidator, workspaceMember, async (c) => {
			const workspace = c.get("workspace");
			const shapeUrl = prepareElectricUrl(c.req.url);
			const whereClause = `workspace_id = '${workspace.id}'`;

			shapeUrl.searchParams.set("table", "category");
			shapeUrl.searchParams.set("where", whereClause);

			const response = await proxyElectricRequest(shapeUrl);

			return c.json(await response.json(), HTTPStatus.codes.OK, headersToRecord(response.headers));
		})
		.get("/wallets", workspaceQueryValidator, workspaceMember, async (c) => {
			const workspace = c.get("workspace");
			const shapeUrl = prepareElectricUrl(c.req.url);
			const whereClause = `workspace_id = '${workspace.id}'`;

			shapeUrl.searchParams.set("table", "wallet");
			shapeUrl.searchParams.set("where", whereClause);

			const response = await proxyElectricRequest(shapeUrl);

			return c.json(await response.json(), HTTPStatus.codes.OK, headersToRecord(response.headers));
		})
		.get("/recurring-bills", workspaceQueryValidator, workspaceMember, async (c) => {
			const workspace = c.get("workspace");
			const shapeUrl = prepareElectricUrl(c.req.url);
			const whereClause = `workspace_id = '${workspace.id}'`;

			shapeUrl.searchParams.set("table", "recurring_bill");
			shapeUrl.searchParams.set("where", whereClause);

			const response = await proxyElectricRequest(shapeUrl);

			return c.json(await response.json(), HTTPStatus.codes.OK, headersToRecord(response.headers));
		})
		.get("/incomes", workspaceQueryValidator, workspaceMember, async (c) => {
			const workspace = c.get("workspace");
			const shapeUrl = prepareElectricUrl(c.req.url);
			const whereClause = `workspace_id = '${workspace.id}'`;

			shapeUrl.searchParams.set("table", "income");
			shapeUrl.searchParams.set("where", whereClause);

			const response = await proxyElectricRequest(shapeUrl);

			return c.json(await response.json(), HTTPStatus.codes.OK, headersToRecord(response.headers));
		})
		.get("/events", workspaceQueryValidator, workspaceMember, async (c) => {
			const workspace = c.get("workspace");
			const shapeUrl = prepareElectricUrl(c.req.url);
			const whereClause = `workspace_id = '${workspace.id}'`;

			shapeUrl.searchParams.set("table", "event");
			shapeUrl.searchParams.set("where", whereClause);

			const response = await proxyElectricRequest(shapeUrl);
			return c.json(await response.json(), HTTPStatus.codes.OK, headersToRecord(response.headers));
		})
		.get("/exchange-rates", async (c) => {
			const shapeUrl = prepareElectricUrl(c.req.url);

			shapeUrl.searchParams.set("table", "fx_rate");

			const response = await proxyElectricRequest(shapeUrl);

			return c.json(await response.json(), HTTPStatus.codes.OK, headersToRecord(response.headers));
		});

	return app;
}
