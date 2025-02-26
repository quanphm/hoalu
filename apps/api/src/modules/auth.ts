import { rateLimiter } from "@hoalu/furnace";
import { cors } from "hono/cors";
import { auth } from "../lib/auth";
import { createHonoInstance } from "../lib/create-app";
import { redis } from "../lib/redis";

export function authModule() {
	const app = createHonoInstance()
		.basePath("/auth")
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
