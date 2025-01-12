import type { AppBindings } from "@/types";
import { apiReference } from "@scalar/hono-api-reference";
import { notFound, onError } from "@woben/furnace/handlers";
import { logger } from "@woben/furnace/middlewares";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";

export function createApp() {
	const app = new Hono<AppBindings>();

	// middlewares
	app.use(cors());
	app.use(requestId());
	app.use(
		logger({
			excludePaths: ["/docs", "/openapi"],
		}),
	);

	// handlers
	app.get("/", (c) => c.text("Welcome to Woben API"));
	app.notFound(notFound);
	app.onError(onError);

	// API Docs
	app
		.get(
			"/openapi",
			openAPISpecs(app, {
				documentation: {
					info: { title: "Woben HTTP API", version: "0.0.1", description: "OpenAPI documentation" },
					servers: [
						{ url: "http://localhost:3000", description: "Local Server" },
						{ url: `https://woben.local.${process.env.DOMAIN}/api`, description: "Woben Server" },
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

	return app;
}
