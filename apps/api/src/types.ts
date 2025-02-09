import type { PinoLogger } from "@hoalu/furnace";
import type { Hono } from "hono";
import type { auth } from "./lib/auth";
import type { EnvSchema } from "./lib/env";

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
