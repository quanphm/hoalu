import type { HonoApp, User } from "@/types";
import { cors } from "hono/cors";
import { auth } from "./auth";

export function configureAuth(app: HonoApp) {
	app.use(
		"/auth/*",
		cors({
			origin: process.env.PUBLIC_APP_BASE_URL!,
			allowHeaders: ["Content-Type", "Authorization"],
			allowMethods: ["POST", "GET", "OPTIONS"],
			exposeHeaders: ["Content-Length"],
			maxAge: 600,
			credentials: true,
		}),
	);

	app.use("*", async (c, next) => {
		// @ts-ignore
		const session = await auth.api.getSession({ headers: c.req.raw.headers });

		if (!session) {
			c.set("user", null);
			c.set("session", null);
			return next();
		}

		c.set("user", session.user as unknown as User);
		c.set("session", session.session);
		return next();
	});

	app.all("/auth/*", (c) => {
		return auth.handler(c.req.raw);
	});
}
