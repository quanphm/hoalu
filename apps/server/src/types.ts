import type { Hono } from "hono";
import type { PinoLogger } from "@woben/furnace/middlewares";
import type { routes } from "./app";

export interface AppBindings {
	Variables: {
		logger: PinoLogger;
	};
}

export type HonoApp = Hono<AppBindings>;

export type ApiRoutes = typeof routes;
