import { rateLimiter } from "@hoalu/furnace";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { createHonoInstance } from "./create-app";
import { redis } from "./redis";

export function configureAuth() {
	const app = createHonoInstance().basePath("/auth");

	app
		.use(
			cors({
				origin: [process.env.PUBLIC_APP_BASE_URL],
				allowHeaders: ["Content-Type", "Authorization"],
				allowMethods: ["POST", "GET", "OPTIONS"],
				exposeHeaders: ["Content-Length"],
				maxAge: 600,
				credentials: true,
			}),
		)
		.use(rateLimiter(redis))
		.all("/*", (c) => {
			return auth.handler(c.req.raw);
		});

	return app;
}
