import type { Hono } from "hono";

import type { PinoLogger } from "@hoalu/furnace";

import type { auth } from "#api/lib/auth.ts";
import type { EnvSchema } from "#api/lib/env.ts";

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session.session;

export interface AppBindings {
	Variables: {
		user: User | null;
		session: Session | null;
		logger: PinoLogger;
	};
}

export type HonoApp = Hono<AppBindings>;

declare global {
	namespace NodeJS {
		interface ProcessEnv extends EnvSchema {}
	}
}
