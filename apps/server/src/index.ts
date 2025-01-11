import type { Serve } from "bun";
import { app, type routes } from "./app";
import { verifyEnv } from "./env";

verifyEnv();

export default {
	port: 3000,
	fetch: app.fetch,
	idleTimeout: 60,
} satisfies Serve;

export type ApiRoutes = typeof routes;
