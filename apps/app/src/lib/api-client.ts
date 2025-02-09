import type { ApiRoutes } from "@hoalu/api/types";
import { hc } from "hono/client";

/**
 * APIs that DO NOT need Authentication cookies.
 */
export const publicApiClient = hc<ApiRoutes>(`${import.meta.env.PUBLIC_API_URL}`);

/**
 * APIs that MUST be called with Authentication cookies.
 */
export const authApiClient = hc<ApiRoutes>(`${import.meta.env.PUBLIC_API_URL}`, {
	init: {
		credentials: "include",
	},
});
