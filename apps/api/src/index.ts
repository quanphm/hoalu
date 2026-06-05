import { serve } from "@hono/node-server";

import { app } from "#api/app.ts";
import { verifyEnv } from "#api/lib/env.ts";

import type { ApiRoutes } from "#api/modules/api.ts";

verifyEnv();

serve({ fetch: app.fetch, port: 3000 });

export type { ApiRoutes };
