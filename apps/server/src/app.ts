import { syncRoute } from "./routes/sync.route";
import { usersRoute } from "./routes/users.route";
import { createApp } from "./utils/create-app";

export const app = createApp();
export const routes = app.route("/sync", syncRoute).route("/users", usersRoute);
