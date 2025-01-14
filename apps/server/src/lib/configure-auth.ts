import type { HonoApp } from "@/types";
import { cors } from "hono/cors";
import { auth } from "./auth";

export function configureAuth(app: HonoApp) {
	app.use(
		"/auth/*",
		cors({
			origin: process.env.PUBLIC_APP_BASE_URL,
			allowHeaders: ["Content-Type", "Authorization"],
			allowMethods: ["POST", "GET", "OPTIONS"],
			exposeHeaders: ["Content-Length"],
			maxAge: 600,
			credentials: true,
		}),
	);

	app.all("/auth/*", (c) => {
		return auth.handler(c.req.raw);
	});
}
