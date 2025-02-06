import { apiClient } from "@/lib/api-client";

export const fetchTasks = async () => {
	const response = await apiClient.tasks.$get({
		query: {
			workspaceIdOrSlug: "ws",
		},
	});
	const { data } = await response.json();
	return data;
};
