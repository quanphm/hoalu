import { createApp } from "./lib/create-app";
import { userSession } from "./middlewares/user-session";
import { apiModule } from "./modules/api";
import { authModule } from "./modules/auth";
import { openAPIModule } from "./modules/openapi";
import { syncModule } from "./modules/sync";

export const app = createApp();

const authRoute = authModule();
const apiRoute = apiModule();
const syncRoute = syncModule();

openAPIModule(app);

app.use(userSession).route("/", authRoute).route("/", apiRoute).route("/", syncRoute);
