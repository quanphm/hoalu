import { hc } from "@/utils/http-client";
// import * as v from "valibot";

export const fetchUsers = async () => {
	const response = await hc.api.users.$get();
	const { data } = await response.json();
	return data;
};

export const createUser = async (payload: { username: string; email: string }) => {
	const response = await hc.api.users.$post({
		json: {
			username: payload.username,
			email: payload.email,
		},
	});

	if (response.status === 400) {
		const result = await response.json();
		throw new Error(result.message);
	}

	const result = await response.json();
	return result.data;
};
