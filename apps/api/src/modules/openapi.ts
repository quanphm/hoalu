import { Scalar } from "@scalar/hono-api-reference";
import { openAPIRouteHandler } from "hono-openapi";

import type { HonoApp } from "#api/types.ts";

export function openAPIModule(app: HonoApp) {
	app
		.get(
			"/openapi",
			openAPIRouteHandler(app, {
				documentation: {
					info: {
						title: "Hoalu API",
						description: "OpenAPI documentation",
						version: "0.16.0",
					},
					servers: [{ url: process.env.PUBLIC_API_URL }],
				},
			}),
		)
		.get(
			"/reference",
			Scalar({
				pageTitle: "API Documentation",
				theme: "saturn",
				layout: "modern",
				url: "/openapi",
				hideDownloadButton: true,
				sources: [
					{ url: "/openapi", title: "API" },
					{ url: "/auth/open-api/generate-schema", title: "Auth" },
				],
			}),
		);
}
