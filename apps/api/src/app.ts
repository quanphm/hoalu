import { type ApiRoutes, configureAPI } from "./lib/configure-api";
import { configureAuth } from "./lib/configure-auth";
import { configureElectricSync } from "./lib/configure-electric-sync";
import { configureOpenAPI } from "./lib/configure-openapi";
import { createApp } from "./lib/create-app";

export const app = createApp();

configureAuth(app);
configureElectricSync(app);
configureAPI(app);
configureOpenAPI(app);

export type { ApiRoutes };
