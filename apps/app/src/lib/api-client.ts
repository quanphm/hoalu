import type { routes } from "@woben/server/types";
import { hc } from "hono/client";

export const apiClient = hc<typeof routes>(import.meta.env.PUBLIC_API_URL);
