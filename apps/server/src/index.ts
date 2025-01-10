import type { Serve } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { verifyEnv } from "./env";
import { syncRoute } from "./routes/sync.route";
import { usersRoute } from "./routes/users.route";

verifyEnv();

export const app = new Hono();

app.use(logger());
app.use(cors());

app.get("/", (c) => c.text("Welcome to Woben API"));
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

const routes = app.route("/sync", syncRoute).route("/users", usersRoute);

export default {
	port: 3000,
	fetch: app.fetch,
	idleTimeout: 120,
} satisfies Serve;

export type ServerRoutes = typeof routes;
