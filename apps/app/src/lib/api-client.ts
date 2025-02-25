import type { ApiRoutes } from "@hoalu/api/types";
import { hc } from "hono/client";

export const apiClient = hc<ApiRoutes>(`${import.meta.env.PUBLIC_API_URL}`, {
	init: {
		credentials: "include",
	},
});
