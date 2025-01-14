import type { AppBindings } from "@/types";
import { logger, notFound, onError } from "@woben/furnace/hono";
import { Hono } from "hono";
import { requestId } from "hono/request-id";

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

	app.get("/", (c) => c.text("Welcome to Woben API"));

	// handlers
	app.notFound(notFound);
	app.onError(onError);

	return app;
}
