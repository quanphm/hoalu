import { apiReference } from "@scalar/hono-api-reference";
import { notFound } from "@woben/furnace/handlers";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { syncRoute } from "./routes/sync.route";
import { usersRoute } from "./routes/users.route";

export const app = new Hono();

app.use(logger());
app.use(cors());

app.get("/", (c) => c.text("Welcome to Woben API"));
app.notFound(notFound);

const routes = app
	.get(
		"/openapi",
		openAPISpecs(app, {
			documentation: {
				info: { title: "Woben HTTP API", version: "0.0.1", description: "OpenAPI documentation" },
				servers: [
					{ url: "http://localhost:3000", description: "Local Server" },
					{ url: `https://woben.local.${process.env.DOMAIN}/api`, description: "Woben Server" },
				],
			},
		}),
	)
	.get(
		"/docs",
		apiReference({
			theme: "kepler",
			spec: { url: "/openapi" },
		}),
	)
	.route("/sync", syncRoute)
	.route("/users", usersRoute);

export type ServerRoutes = typeof routes;
