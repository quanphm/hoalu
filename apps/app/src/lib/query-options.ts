import { TIME_IN_MILLISECONDS } from "@/helpers/constants";
import { queryOptions } from "@tanstack/react-query";
import { authClient } from "./auth-client";

export const listWorkspacesOptions = () => {
	return queryOptions({
		queryKey: ["workspaces"],
		queryFn: async () => {
			const { data } = await authClient.workspace.list();
			if (!data) return [];
			return data;
		},
		staleTime: TIME_IN_MILLISECONDS.HOUR,
		placeholderData: [],
	});
};

export const getFullWorkspaceOptions = (slug: string) => {
	return queryOptions({
		queryKey: ["workspaces", slug],
		queryFn: async () => {
			const { data } = await authClient.workspace.getFullWorkspace({
				query: {
					idOrSlug: slug,
				},
			});
			if (!data) return null;
			return data;
		},
		staleTime: TIME_IN_MILLISECONDS.HOUR,
	});
};
