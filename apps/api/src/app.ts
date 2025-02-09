import { authGuard } from "@hoalu/furnace";
import { cors } from "hono/cors";
import { configureAPI } from "./lib/configure-api";
import { configureAuth } from "./lib/configure-auth";
import { configureElectricSync } from "./lib/configure-electric-sync";
import { configureOpenAPI } from "./lib/configure-openapi";
import { createApp } from "./lib/create-app";

export const app = createApp();

configureOpenAPI(app);
configureAuth(app);

app
	.use(
		cors({
			origin: process.env.PUBLIC_APP_BASE_URL,
			allowMethods: ["POST", "GET", "OPTIONS"],
			maxAge: 600,
			credentials: true,
		}),
	)
	.use(authGuard());

configureAPI(app);
configureElectricSync(app);
