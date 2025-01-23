import { authGuard } from "@hoalu/furnace";
import { configureAuth } from "./lib/configure-auth";
import { configureElectricSync } from "./lib/configure-electric-sync";
import { configureOpenAPI } from "./lib/configure-openapi";
import { createApp } from "./lib/create-app";
import { tasksRoute } from "./routes/tasks";
import type { AppBindings } from "./types";

export const app = createApp();

configureAuth(app);
configureOpenAPI(app);
configureElectricSync(app);

const routes = app.use(authGuard<AppBindings>()).route("/tasks", tasksRoute);

export type ApiRoutes = typeof routes;
