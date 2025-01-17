import type { Serve } from "bun";
import { app } from "./app";
import { verifyEnv } from "./lib/env";

verifyEnv();

export default {
	port: 3000,
	fetch: app.fetch,
	idleTimeout: 60,
} satisfies Serve;
