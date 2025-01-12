import type { AppBindings } from "@/types";
import { notFound, onError } from "@woben/furnace/handlers";
import { logger } from "@woben/furnace/middlewares";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";

export function createHonoInstance() {
	return new Hono<AppBindings>();
}

export function createApp() {
	const app = createHonoInstance();

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

	return app;
}
