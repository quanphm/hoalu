import { TIME_IN_MILLISECONDS } from "@hoalu/datetime/datetime";
import { queryOptions } from "@tanstack/react-query";

import { apiClient } from "#app/lib/api-client.ts";
import { authClient, type Session, type SessionData, type User } from "#app/lib/auth-client.ts";
import {
	authKeys,
	categoryKeys,
	fileKeys,
	memberKeys,
	recurringBillKeys,
	taskKeys,
	walletKeys,
	workspaceKeys,
} from "#app/lib/query-key-factory.ts";

/**
 * auth
 */

export const sessionOptions = () => {
	return queryOptions({
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
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

/**
 * workspaces
 */

export const listWorkspacesOptions = () => {
	return queryOptions({
		queryKey: workspaceKeys.all,
		queryFn: async () => {
			const { data } = await authClient.workspace.list();
			if (!data) return [];
			return data;
		},
		placeholderData: [],
	});
};

export const listInvitationsOptions = (slug: string) => {
	return queryOptions({
		queryKey: workspaceKeys.invitations(slug),
		queryFn: async () => {
			const { data } = await authClient.workspace.listInvitations({
				query: { idOrSlug: slug, status: "pending" },
			});
			if (!data) return [];
			return data;
		},
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
	});
};

export const listWorkspaceSummariesOptions = () => {
	return queryOptions({
		queryKey: workspaceKeys.summaries(),
		queryFn: async () => {
			const res = await apiClient.workspaces.listSummaries();
			return res;
		},
	});
};

export const getWorkspaceSummaryOptions = (id: string) => {
	return queryOptions({
		queryKey: workspaceKeys.summary(id),
		queryFn: async () => {
			const res = await apiClient.workspaces.getSummary(id);
			return res;
		},
	});
};

export const getActiveMemberOptions = (slug: string) => {
	return queryOptions({
		queryKey: memberKeys.all(slug),
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

export const workspaceLogoOptions = (slug: string, logo: string | null | undefined) => {
	return queryOptions({
		enabled: logo?.startsWith("s3://"),
		queryKey: workspaceKeys.logo(slug),
		queryFn: async () => {
			const data = await apiClient.files.getWorkspaceLogo(slug);
			return data;
		},
		retry: 2,
	});
};

/**
 * tasks
 */

export const tasksQueryOptions = (slug: string) => {
	return queryOptions({
		queryKey: taskKeys.all(slug),
		queryFn: () => apiClient.tasks.list(slug),
	});
};

/**
 * wallets
 */

export const walletsQueryOptions = (slug: string) => {
	return queryOptions({
		queryKey: walletKeys.all(slug),
		queryFn: () => apiClient.wallets.list(slug),
		select: (data) => {
			return data.sort((a, b) => b.total - a.total);
		},
	});
};

export const walletWithIdQueryOptions = (slug: string, id: string) => {
	return queryOptions({
		queryKey: walletKeys.withId(slug, id),
		queryFn: () => apiClient.wallets.get(slug, id),
	});
};

/**
 * categories
 */

export const categoriesQueryOptions = (slug: string) => {
	return queryOptions({
		placeholderData: [],
		queryKey: categoryKeys.all(slug),
		queryFn: () => apiClient.categories.list(slug),
		select: (data) => {
			return data.sort((a, b) => b.total - a.total);
		},
	});
};

export const categoryWithIdQueryOptions = (slug: string, id: string) => {
	return queryOptions({
		queryKey: categoryKeys.withId(slug, id),
		queryFn: () => apiClient.categories.get(slug, id),
		enabled: !!id,
	});
};

/**
 * recurring bills - all active
 */

export const recurringBillsQueryOptions = (slug: string) => {
	return queryOptions({
		queryKey: recurringBillKeys.all(slug),
		queryFn: () => apiClient.recurringBills.list(slug),
	});
};

/**
 * recurring bills - unified (overdue + today + upcoming)
 */

export const unifiedBillsQueryOptions = (slug: string) => {
	return queryOptions({
		queryKey: [...workspaceKeys.withSlug(slug), "unified-bills"],
		queryFn: () => apiClient.recurringBills.getUnified(slug),
		staleTime: TIME_IN_MILLISECONDS.MINUTE,
		placeholderData: { overdue: [], today: [], upcoming: [] },
	});
};

/**
 * files
 */

export const filesQueryOptions = (slug: string) => {
	return queryOptions({
		queryKey: fileKeys.all(slug),
		queryFn: () => apiClient.files.getFiles(slug),
	});
};

export const expenseFilesQueryOptions = (slug: string, expenseId: string) => {
	return queryOptions({
		queryKey: [...fileKeys.all(slug), "expense", expenseId],
		queryFn: () => apiClient.files.getExpenseFiles(slug, expenseId),
		enabled: !!expenseId,
	});
};
