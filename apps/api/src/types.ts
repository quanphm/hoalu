import type { PinoLogger } from "@woben/furnace";
import type { Hono } from "hono";
import type * as v from "valibot";
import type { auth } from "./lib/auth";
import type { ServerEnvSchema } from "./lib/env";

export type User = Omit<typeof auth.$Infer.Session.user, "id"> & {
	id: number;
};
export type Session = Omit<typeof auth.$Infer.Session.session, "id" | "userId"> & {
	id: number;
	userId: number;
};

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
