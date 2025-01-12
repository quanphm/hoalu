import { syncRoute } from "./routes/sync.route";
import { usersRoute } from "./routes/users.route";
import { configureOpenAPI } from "./utils/configure-open-api";
import { createApp } from "./utils/create-app";

export const app = createApp();
configureOpenAPI(app);

export const routes = app.route("/sync", syncRoute).route("/users", usersRoute);
