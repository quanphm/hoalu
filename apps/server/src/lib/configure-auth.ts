import type { HonoApp } from "@/types";
import { cors } from "hono/cors";
import { auth } from "./auth";

export function configureAuth(app: HonoApp) {
	app.use(
		"/auth/*",
		cors({
			origin: "http://localhost:5173",
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
