import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth";
import type { AppBindings, Session, User } from "../types";

export const userSession = createMiddleware<AppBindings>(async (c, next) => {
	const session = await auth.api.getSession({
		// @ts-ignore
		headers: c.req.raw.headers,
	});
	c.set("user", (session?.user as unknown as User) || null);
	c.set("session", (session?.session as unknown as Session) || null);
	await next();
});
