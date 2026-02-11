import type { HonoApp } from "#api/types.ts";
import { Scalar } from "@scalar/hono-api-reference";

export function openAPIModule(app: HonoApp) {
	app.get(
		"/reference",
		Scalar({
			pageTitle: "API Documentation",
			theme: "saturn",
			layout: "modern",
			url: "/openapi",
			hideDownloadButton: true,
			sources: [
				{ url: "bff/openapi", title: "API" },
				{ url: "auth/open-api/generate-schema", title: "Auth" },
				{ url: "health/openapi", title: "Healthchecks" },
			],
		}),
	);
}
