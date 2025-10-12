import { app } from "./app";
import { verifyEnv } from "./lib/env";
import type { ApiRoutes } from "./modules/api";

verifyEnv();

export default {
	port: 3000,
	fetch: app.fetch,
	idleTimeout: 60,
};

export type { ApiRoutes };
