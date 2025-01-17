import type { PinoLogger } from "@woben/furnace/hono";
import type { Hono } from "hono";
import type * as v from "valibot";
import type { auth } from "./lib/auth";
import type { ServerEnvSchema } from "./lib/env";

export type User = Omit<typeof auth.$Infer.Session.user, "id"> & {
	id: number;
};
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
		interface ProcessEnv extends v.InferInput<typeof ServerEnvSchema> {}
	}
}
