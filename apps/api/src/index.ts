import { app } from "#api/app.ts";
import { verifyEnv } from "#api/lib/env.ts";
import type { ApiRoutes } from "#api/modules/api.ts";

verifyEnv();

export default {
	port: 3000,
	fetch: app.fetch,
	idleTimeout: 60,
};

export type { ApiRoutes };
