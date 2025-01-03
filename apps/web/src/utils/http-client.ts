import type { ServerRoutes } from "@woben/server";
import { hc as honoClient } from "hono/client";

export const hc = honoClient<ServerRoutes>("http://localhost:3000/");
