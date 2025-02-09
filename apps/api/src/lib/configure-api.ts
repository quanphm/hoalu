import { authGuard, rateLimiter } from "@hoalu/furnace";
import { cors } from "hono/cors";
import { tasksRoute } from "../routes/tasks";
import type { HonoApp } from "../types";
import { redis } from "./redis";

export function configureAPI(app: HonoApp) {
	const routes = app
		.use(cors())
		.use(authGuard())
		.use(rateLimiter(redis))
		.route("/tasks", tasksRoute);
	return routes;
}

export type ApiRoutes = ReturnType<typeof configureAPI>;
