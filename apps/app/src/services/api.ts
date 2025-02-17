import { authApiClient } from "@/lib/api-client";

export const fetchTasks = async (workspaceIdOrSlug: string) => {
	const response = await authApiClient.api.tasks.$get({
		query: { workspaceIdOrSlug },
	});
	if (!response.ok) {
		const { message } = await response.json();
		throw new Error(message);
	}
	const { data } = await response.json();
	return data;
};
