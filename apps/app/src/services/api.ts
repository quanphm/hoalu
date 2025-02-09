import { apiClient } from "@/lib/api-client";

export const fetchTasks = async (workspaceIdOrSlug: string) => {
	const response = await apiClient.tasks.$get({
		query: {
			workspaceIdOrSlug,
		},
	});
	const { data } = await response.json();
	return data;
};
