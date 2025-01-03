import { env } from "@/env";
import type { ServerRoutes } from "@woben/server";
import { hc as honoClient } from "hono/client";

export const hc = honoClient<ServerRoutes>(env.API_URL);
