import { createMiddleware } from "hono/factory";

import { auth } from "#api/lib/auth.ts";
import type { AppBindings } from "#api/types.ts";

export const userSession = createMiddleware<AppBindings>(async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });

	if (!session) {
		c.set("user", null);
		c.set("session", null);
		return next();
	}

	c.set("user", session.user);
	c.set("session", session.session);
	return next();
});
