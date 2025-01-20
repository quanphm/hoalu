import type { ApiRoutes } from "@woben/api/types";
import { hc } from "hono/client";

export const apiClient = hc<ApiRoutes>(import.meta.env.PUBLIC_API_URL);
