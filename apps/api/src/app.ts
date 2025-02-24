import { auth } from "./lib/auth";
import { createApp } from "./lib/create-app";
import { apiModule } from "./modules/api";
import { authModule } from "./modules/auth";
import { openAPIModule } from "./modules/openapi";
import { syncModule } from "./modules/sync";
import type { Session, User } from "./types";

export const app = createApp();

const authRoute = authModule();
const apiRoute = apiModule();
const syncRoute = syncModule();

openAPIModule(app);

app
	.route("/", authRoute)
	.use(async (c, next) => {
		const session = await auth.api.getSession({
			// @ts-ignore
			headers: c.req.raw.headers,
		});
		c.set("user", (session?.user as unknown as User) || null);
		c.set("session", (session?.session as unknown as Session) || null);
		await next();
	})
	.route("/", apiRoute)
	.route("/", syncRoute);
