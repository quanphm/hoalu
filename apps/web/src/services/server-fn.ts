/**
 * @see https://tanstack.com/router/latest/docs/framework/react/start/server-functions
 */

import { apiClient } from "@/utils/http-client";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { setResponseStatus } from "vinxi/http";

export const fetchUsers = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const result = await apiClient.get("/users").then((r) => r.data);
		return result.data;
	} catch (err) {
		if ((err as any).status === 404) {
			throw notFound();
		}
		throw err;
	}
});

export const createUser = createServerFn({ method: "POST" })
	.validator((data: FormData) => {
		const username = data.get("username");
		const email = data.get("email");
		return {
			username,
			email,
		};
	})
	.handler(async ({ data }) => {
		try {
			const result = await apiClient.post("/users", data).then((r) => r.data);
			setResponseStatus(201);
			return result;
		} catch (err) {
			throw err;
		}
	});
