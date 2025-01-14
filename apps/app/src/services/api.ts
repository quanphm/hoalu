import { apiClient } from "@/lib/api-client";

export const fetchUsers = async () => {
	const response = await apiClient.users.$get();
	const { data } = await response.json();
	return data;
};

export const createUser = async (payload: { username: string; email: string }) => {
	console.log(payload);
	return {};
};
