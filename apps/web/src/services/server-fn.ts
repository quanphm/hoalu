/**
 * @see https://tanstack.com/router/latest/docs/framework/react/start/server-functions
 */

import { apiClient } from "@/utils/http-client";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";

export const fetchUsers = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const result = await apiClient.get("/users").then((r) => r.data);
		return result;
	} catch (err) {
		if ((err as any).status === 404) {
			throw notFound();
		}
		throw err;
	}
});
