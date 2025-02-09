import { auth } from "./lib/auth";
import { configureAPI } from "./lib/configure-api";
import { configureAuth } from "./lib/configure-auth";
import { configureOpenAPI } from "./lib/configure-openapi";
import { configureElectricSync } from "./lib/configure-sync";
import { createApp } from "./lib/create-app";
import type { Session, User } from "./types";

export const app = createApp();

configureOpenAPI(app);

const authRoute = configureAuth();
app.route("/", authRoute);

app.use(async (c, next) => {
	const session = await auth.api.getSession({
		// @ts-ignore
		headers: c.req.raw.headers,
	});
	c.set("user", (session?.user as unknown as User) || null);
	c.set("session", (session?.session as unknown as Session) || null);
	await next();
});

const apiRoute = configureAPI();
app.route("/", apiRoute);

const syncRoute = configureElectricSync();
app.route("/", syncRoute);
