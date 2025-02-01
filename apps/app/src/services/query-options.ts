import { TIME_IN_MILLISECONDS } from "@/helpers/constants";
import { authClient } from "@/lib/auth-client";
import * as api from "@/services/api";
import { invitationKeys, memberKeys, taskKeys, workspaceKeys } from "@/services/query-key-factory";
import { queryOptions } from "@tanstack/react-query";

export const listWorkspacesOptions = () => {
	return queryOptions({
		queryKey: workspaceKeys.all,
		queryFn: async () => {
			const { data } = await authClient.workspace.list();
			if (!data) return [];
			return data;
		},
		staleTime: TIME_IN_MILLISECONDS.HOUR,
		placeholderData: [],
	});
};

export const getWorkspaceDetailsOptions = (slug: string) => {
	return queryOptions({
		queryKey: workspaceKeys.withSlug(slug),
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

export const getActiveMemberOptions = (slug: string) => {
	return queryOptions({
		queryKey: memberKeys.activeWithSlug(slug),
		queryFn: async () => {
			const { data } = await authClient.workspace.getActiveMember({
				query: {
					idOrSlug: slug,
				},
			});
			if (!data) return null;
			return data;
		},
	});
};

export const invitationDetailsOptions = (id: string) => {
	return queryOptions({
		queryKey: invitationKeys.withId(id),
		queryFn: async () => {
			const { data } = await authClient.workspace.getInvitation({
				query: { id },
			});
			if (!data) return null;
			return data;
		},
	});
};

export const tasksQueryOptions = () => {
	return queryOptions({
		queryKey: taskKeys.all,
		queryFn: () => api.fetchTasks(),
	});
};
