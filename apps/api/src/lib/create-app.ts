import { logger, notFound, onError } from "@hoalu/furnace";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import type { AppBindings } from "../types";

export function createHonoInstance() {
	return new Hono<AppBindings>();
}

export function createApp() {
	const app = createHonoInstance();

	// middlewares
	app.use(requestId());
	app.use(
		logger({
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
