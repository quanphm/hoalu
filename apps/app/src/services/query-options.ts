import { apiClient } from "@/lib/api-client";
import { type Session, type SessionData, type User, authClient } from "@/lib/auth-client";
import type { ExchangeRatesQuerySchema } from "@/lib/schema";
import {
	authKeys,
	categoryKeys,
	exchangeRateKeys,
	expenseKeys,
	fileKeys,
	memberKeys,
	taskKeys,
	walletKeys,
	workspaceKeys,
} from "@/services/query-key-factory";
import { TIME_IN_MILLISECONDS } from "@hoalu/common/time";
import { queryOptions } from "@tanstack/react-query";

/**
 * auth
 */

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
		staleTime: TIME_IN_MILLISECONDS.DAY,
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
 * expenses
 */

export const expensesQueryOptions = (slug: string) => {
	return queryOptions({
		queryKey: expenseKeys.all(slug),
		queryFn: () => apiClient.expenses.list(slug),
		select: (data) => {
			console.log(data);
			return data;
		},
	});
};

export const expenseWithIdQueryOptions = (slug: string, id: string) => {
	return queryOptions({
		queryKey: expenseKeys.withId(slug, id),
		queryFn: () => apiClient.expenses.get(slug, id),
	});
};

/**
 * exchange-rates
 */

export const exchangeRatesQueryOptions = ({ from = "USD", to }: ExchangeRatesQuerySchema) => {
	return queryOptions({
		queryKey: exchangeRateKeys.pair({ from, to }),
		queryFn: () => apiClient.exchangeRates.find({ from, to }),
		staleTime: TIME_IN_MILLISECONDS.DAY,
		select: (data) => data.rate,
		enabled: from !== to,
		retry: 1,
	});
};

/**
 * files
 */

export const filesQueryOptions = (slug: string) => {
	return queryOptions({
		queryKey: fileKeys.all(slug),
		queryFn: () => apiClient.files.getFiles(slug),
		staleTime: TIME_IN_MILLISECONDS.DAY,
		retry: 1,
	});
};
