import type { PinoLogger } from "@woben/furnace/hono";
import type { Hono } from "hono";
import type { auth } from "./lib/auth";

type User = Omit<typeof auth.$Infer.Session.user, "id"> & {
	id: number;
};
type Session = typeof auth.$Infer.Session.session;

export interface AppBindings {
	Variables: {
		user: User | null;
		session: Session | null;
		logger: PinoLogger;
	};
}

export type HonoApp = Hono<AppBindings>;
