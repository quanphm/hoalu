import { authGuard, rateLimiter } from "@hoalu/furnace";
import { cors } from "hono/cors";
import { tasksRoute } from "../routes/tasks";
import { createHonoInstance } from "./create-app";
import { redis } from "./redis";

export function configureAPI() {
	const app = createHonoInstance().basePath("/api");

	app
		.use(
			cors({
				origin: [process.env.PUBLIC_APP_BASE_URL],
				exposeHeaders: ["content-length", "content-encoding"],
				credentials: true,
			}),
		)
		.use(authGuard())
		.use(rateLimiter(redis));

	const routes = app.route("/tasks", tasksRoute);
	return routes;
}

export type ApiRoutes = ReturnType<typeof configureAPI>;
