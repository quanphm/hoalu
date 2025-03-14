import { apiReference } from "@scalar/hono-api-reference";
import { openAPISpecs } from "hono-openapi";
import type { HonoApp } from "../types";

export function openAPIModule(app: HonoApp) {
	app
		.get(
			"/openapi",
			openAPISpecs(app, {
				documentation: {
					info: {
						title: "Hoalu API",
						description: "OpenAPI documentation",
						version: "0.5.0",
					},
					servers: [{ url: process.env.PUBLIC_API_URL }],
				},
			}),
		)
		.get(
			"/reference",
			apiReference({
				theme: "saturn",
				layout: "modern",
				spec: { url: "openapi" },
				hideDownloadButton: true,
			}),
		);
}
