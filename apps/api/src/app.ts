import { configureApi } from "./lib/configure-api";
import { configureAuth } from "./lib/configure-auth";
import { configureElectricSync } from "./lib/configure-electric-sync";
import { configureOpenAPI } from "./lib/configure-openapi";
import { createApp } from "./lib/create-app";

export const app = createApp();

configureAuth(app);
configureOpenAPI(app);
configureElectricSync(app);
configureApi(app);
