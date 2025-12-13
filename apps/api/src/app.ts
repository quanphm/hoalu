import { createApp } from "#api/lib/create-app.ts";
import { userSession } from "#api/middlewares/user-session.ts";
import { apiModule } from "#api/modules/api.ts";
import { authModule } from "#api/modules/auth.ts";
import { openAPIModule } from "#api/modules/openapi.ts";
import { syncModule } from "#api/modules/sync.ts";

export const app = createApp().basePath("/api");

const authRoute = authModule();
const apiRoute = apiModule();
const syncRoute = syncModule();

openAPIModule(app);

app.use(userSession).route("/", authRoute).route("/", apiRoute).route("/", syncRoute);
