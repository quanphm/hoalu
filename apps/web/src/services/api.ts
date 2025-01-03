/**
 * @see https://tanstack.com/router/latest/docs/framework/react/start/server-functions
 */

import { hc } from "@/utils/http-client";
import { createServerFn } from "@tanstack/start";
import * as v from "valibot";

export const fetchUsers = createServerFn({ method: "GET" }).handler(async () => {
	const response = await hc.api.users.$get();
	const { data } = await response.json();
	return data;
});

export const createUser = createServerFn()
	.validator(
		v.object({
			username: v.string(),
			email: v.pipe(v.string(), v.email()),
		}),
	)
	.handler(async ({ data }) => {
		const response = await hc.api.users.$post({
			json: {
				username: data.username,
				email: data.email,
			},
		});

		if (response.status === 400) {
			const result = await response.json();
			throw new Error(result.message);
		}

		const result = await response.json();
		return result.data;
	});
