import { TIME_IN_MILLISECONDS } from "@/helpers/constants";
import { type Session, type SessionData, type User, authClient } from "@/lib/auth-client";
import * as api from "@/services/api";
import {
	authKeys,
	invitationKeys,
	memberKeys,
	taskKeys,
	workspaceKeys,
} from "@/services/query-key-factory";
import { queryOptions } from "@tanstack/react-query";

export const sessionOptions = () => {
	return queryOptions({
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		staleTime: 0,
		queryKey: authKeys.session,
		queryFn: async () => {
			const { data } = await authClient.getSession();
			return data;
		},
		select: (data) => {
			if (!data) return null;

			const isSessionExpired = () => {
				const expiresAt = new Date(data.session.expiresAt).getTime();
				const now = Date.now();
				return expiresAt < now;
			};

			const sessionData: SessionData | undefined = isSessionExpired() ? undefined : data;
			const session = sessionData?.session as Session | undefined;
			const user = sessionData?.user as User | undefined;

			return {
				user,
				session,
			};
		},
	});
};

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
			const { data, error } = await authClient.workspace.getFullWorkspace({
				query: {
					idOrSlug: slug,
				},
			});
			if (error) throw error;
			return data;
		},
		staleTime: TIME_IN_MILLISECONDS.HOUR,
	});
};

export const getActiveMemberOptions = (slug: string) => {
	return queryOptions({
		queryKey: memberKeys.activeWithSlug(slug),
		queryFn: async () => {
			const { data, error } = await authClient.workspace.getActiveMember({
				query: {
					idOrSlug: slug,
				},
			});
			if (error) throw error;
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

export const tasksQueryOptions = (slug: string) => {
	return queryOptions({
		queryKey: taskKeys.all,
		queryFn: () => api.fetchTasks(slug),
	});
};
