import { configureAuth } from "@/lib/configure-auth";
import { configureElectricSync } from "@/lib/configure-electric-sync";
import { configureOpenAPI } from "@/lib/configure-openapi";
import { createApp } from "@/lib/create-app";
import { tasksRoute } from "@/routes/tasks";

export const app = createApp();

configureAuth(app);
configureElectricSync(app);
configureOpenAPI(app);

const routes = app.route("/tasks", tasksRoute);

export type ApiRoutes = typeof routes;
