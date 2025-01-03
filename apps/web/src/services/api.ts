/**
 * @see https://tanstack.com/router/latest/docs/framework/react/start/server-functions
 */

import { honoClient } from "@/utils/http-client";
import { createServerFn } from "@tanstack/start";
import * as v from "valibot";

export const fetchUsers = createServerFn({ method: "GET" }).handler(async () => {
	const response = await honoClient.api.users.$get();
	const result = await response.json();
	return result.data;
});

export const createUser = createServerFn()
	.validator(
		v.object({
			username: v.string(),
			email: v.pipe(v.string(), v.email()),
		}),
	)
	.handler(async ({ data }) => {
		const result = await honoClient.api.users.$post({
			json: {
				username: data.username,
				email: data.email,
			},
		});
		return await result.json();
	});
