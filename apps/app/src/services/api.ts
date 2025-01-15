import { apiClient } from "@/lib/api-client";

export const fetchTasks = async () => {
	const response = await apiClient.tasks.$get();
	const { data } = await response.json();
	return data;
};
