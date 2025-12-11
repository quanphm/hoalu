import { cors } from "hono/cors";
import { openAPIRouteHandler } from "hono-openapi";

import { authGuard, rateLimiter } from "@hoalu/furnace";

import { createHonoInstance } from "#api/lib/create-app.ts";
import { redis } from "#api/lib/redis.ts";
// routes
import categoriesRoute from "#api/routes/categories/index.ts";
import exchangeRatesRoute from "#api/routes/exchange-rates/index.ts";
import expensesRoute from "#api/routes/expenses/index.ts";
import filesRoute from "#api/routes/files/index.ts";
import tasksRoute from "#api/routes/tasks/index.ts";
import walletsRoute from "#api/routes/wallets/index.ts";

export function apiModule() {
	const app = createHonoInstance()
		.basePath("/bff")
		.use(
			cors({
				origin: [process.env.PUBLIC_APP_BASE_URL],
				exposeHeaders: ["Content-Length", "Content-Encoding"],
				credentials: true,
			}),
		)
		.use(authGuard())
		.use(rateLimiter(redis))
		.route("/categories", categoriesRoute)
		.route("/exchange-rates", exchangeRatesRoute)
		.route("/expenses", expensesRoute)
		.route("/files", filesRoute)
		.route("/tasks", tasksRoute)
		.route("/wallets", walletsRoute);

	app.get(
		"/openapi",
		openAPIRouteHandler(app, {
			documentation: {
				info: {
					title: "Hoalu API",
					description: "OpenAPI documentation",
					version: "0.16.0",
				},
				servers: [{ url: process.env.PUBLIC_API_URL }],
			},
		}),
	);

	return app;
}

export type ApiRoutes = ReturnType<typeof apiModule>;
