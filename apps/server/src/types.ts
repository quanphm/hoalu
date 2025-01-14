import type { PinoLogger } from "@woben/furnace/hono";
import type { Hono } from "hono";
import type { auth } from "./lib/auth";

export interface AppBindings {
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null;
		logger: PinoLogger;
	};
}

export type HonoApp = Hono<AppBindings>;
