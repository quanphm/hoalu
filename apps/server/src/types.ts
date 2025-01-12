import type { PinoLogger } from "@woben/furnace/middlewares";
import type { Hono } from "hono";

export interface AppBindings {
	Variables: {
		logger: PinoLogger;
	};
}

export type HonoApp = Hono<AppBindings>;
