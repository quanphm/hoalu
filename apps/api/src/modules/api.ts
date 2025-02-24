import { authGuard, rateLimiter } from "@hoalu/furnace";
import { cors } from "hono/cors";
import { createHonoInstance } from "../lib/create-app";
import { redis } from "../lib/redis";

// routes
import tasksRoute from "../routes/tasks";
import walletsRoute from "../routes/wallets";

export function apiModule() {
	const app = createHonoInstance().basePath("/api");

	app
		.use(
			cors({
				origin: [process.env.PUBLIC_APP_BASE_URL],
				exposeHeaders: ["Content-Length", "Content-Encoding"],
				credentials: true,
			}),
		)
		.use(authGuard())
		.use(rateLimiter(redis))
		.route("/tasks", tasksRoute)
		.route("/wallets", walletsRoute);

	return app;
}

export type ApiRoutes = ReturnType<typeof apiModule>;
