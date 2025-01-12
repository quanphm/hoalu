import type { PinoLogger } from "@woben/furnace/middlewares";
import type { routes } from "./app";

export interface AppBindings {
	Variables: {
		logger: PinoLogger;
	};
}

export type ApiRoutes = typeof routes;
