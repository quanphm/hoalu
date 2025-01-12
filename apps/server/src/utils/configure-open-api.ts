import { apiReference } from "@scalar/hono-api-reference";
import { openAPISpecs } from "hono-openapi";
import packageJson from "../../package.json";
import type { HonoApp } from "@/types";

export function configureOpenAPI(app: HonoApp) {
	app
		.get(
			"/openapi",
			openAPISpecs(app, {
				documentation: {
					info: {
						title: "Woben HTTP API",
						description: "OpenAPI documentation",
						version: packageJson.version,
					},
					servers: [
						{ url: "http://localhost:3000", description: "Local Server" },
						{
							url: `https://woben.local.${process.env.DOMAIN}/api`,
							description: "Production Server",
						},
					],
				},
			}),
		)
		.get(
			"/docs",
			apiReference({
				theme: "kepler",
				spec: { url: "/openapi" },
			}),
		);
}
