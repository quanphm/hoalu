import { auth } from "#api/lib/auth.ts";
import { createHonoInstance } from "#api/lib/create-app.ts";
import { redis } from "#api/lib/redis.ts";
import { rateLimiter } from "@hoalu/furnace";
import { cors } from "hono/cors";

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
