import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { verifyEnv } from "./env";
import { usersRoute } from "./routes/users.route";

verifyEnv();

export const app = new Hono();

app.use(logger());
app.use(cors());

app.get("/", (c) => c.text("Welcome to Woben API"));
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

const routes = app.basePath("/api").route("/users", usersRoute);

serve({
	port: 3000,
	fetch: app.fetch,
});

export type ServerRoutes = typeof routes;
