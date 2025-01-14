import { configureAuth } from "@/lib/configure-auth";
import { configureOpenAPI } from "@/lib/configure-openapi";
import { createApp } from "@/lib/create-app";
import { syncRoute } from "@/routes/sync.route";
import { usersRoute } from "./routes/users.route";

export const app = createApp();

configureAuth(app);
configureOpenAPI(app);

export const routes = app.route("/sync", syncRoute).route("/users", usersRoute);
