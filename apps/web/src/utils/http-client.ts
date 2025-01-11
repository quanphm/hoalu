import type { ApiRoutes } from "@woben/server";
import { hc } from "hono/client";

export const apiClient = hc<ApiRoutes>(import.meta.env.PUBLIC_API_URL);
