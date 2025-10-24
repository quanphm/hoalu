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
						version: "0.13.0",
					},
					servers: [{ url: process.env.PUBLIC_API_URL }],
				},
			}),
		)
		.get(
			"/reference",
			Scalar({
				theme: "saturn",
				layout: "modern",
				url: "/openapi",
				hideDownloadButton: true,
			}),
		);
}
