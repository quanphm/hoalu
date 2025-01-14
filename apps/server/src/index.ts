import { verifyEnv } from "@/lib/env";
import type { Serve } from "bun";
import { app } from "./app";

verifyEnv();

export default {
	port: 3000,
	fetch: app.fetch,
	idleTimeout: 60,
} satisfies Serve;
