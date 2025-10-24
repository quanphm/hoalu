import { Hono } from "hono";
import { etag } from "hono/etag";
import { requestId } from "hono/request-id";

import { logger, notFound, onError } from "@hoalu/furnace";

import type { AppBindings } from "#api/types.ts";

export function createHonoInstance() {
	return new Hono<AppBindings>();
}

export function createApp() {
	const app = createHonoInstance();

	// middlewares
	app.use(requestId());
	app.use(etag());
	app.use(
		logger({
			enabled: process.env.NODE_ENV === "production",
			pretty: process.env.NODE_ENV === "development",
			excludePaths: ["/docs", "/openapi"],
		}),
	);

	app.get("/", (c) => c.text("Welcome to Hoalu"));

	// handlers
	app.notFound(notFound);
	app.onError(onError);

	return app;
}
