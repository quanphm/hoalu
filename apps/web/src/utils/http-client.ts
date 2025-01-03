import type { ServerRoutes } from "@woben/server";
import { hc } from "hono/client";

export const honoClient = hc<ServerRoutes>("http://localhost:3000/");
