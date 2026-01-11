import { queryOptions } from "@tanstack/react-query";

import { datetime, TIME_IN_MILLISECONDS } from "@hoalu/common/datetime";
import { zeroDecimalCurrencies } from "@hoalu/countries";

import { apiClient } from "#app/lib/api-client.ts";
import { authClient, type Session, type SessionData, type User } from "#app/lib/auth-client.ts";
import { queryClient } from "#app/lib/query-client.ts";
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
} from "#app/lib/query-key-factory.ts";
import type {
	ExchangeRatesQuerySchema,
	ExpenseWithClientConvertedSchema,
} from "#app/lib/schema.ts";

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
		staleTime: TIME_IN_MILLISECONDS.DAY,
	});
};

export const listWorkspaceSummariesOptions = () => {
	return queryOptions({
		queryKey: workspaceKeys.summaries(),
		queryFn: async () => {
			const res = await apiClient.workspaces.listSummaries();
			return res;
		},
		staleTime: TIME_IN_MILLISECONDS.MINUTE * 5, // Cache for 5 minutes
	});
};

export const getWorkspaceSummaryOptions = (id: string) => {
	return queryOptions({
		queryKey: workspaceKeys.summary(id),
		queryFn: async () => {
			const res = await apiClient.workspaces.getSummary(id);
			return res;
		},
		staleTime: TIME_IN_MILLISECONDS.MINUTE * 5,
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
 * expenses
 */

export const expensesQueryOptions = (slug: string) => {
	return queryOptions({
		queryKey: expenseKeys.all(slug),
		queryFn: async () => {
			const workspace = queryClient.getQueryData(workspaceKeys.withSlug(slug));
			const expenses = await apiClient.expenses.list(slug);
			const promises = expenses.map(async (expense) => {
				const { realAmount, currency: sourceCurrency } = expense;
				try {
					const result = await queryClient.fetchQuery(
						exchangeRatesQueryOptions({
							from: sourceCurrency,
							to: (workspace as any).metadata.currency,
						}),
					);
					const isNoCent = zeroDecimalCurrencies.find((c) => c === sourceCurrency);
					const factor = isNoCent ? 1 : 100;
					const convertedAmount = realAmount * (result.rate / factor);

					return {
						...expense,
						convertedAmount: convertedAmount,
					};
				} catch (_error) {
					return {
						...expense,
						convertedAmount: -1,
					};
				}
			});
			const result = await Promise.all(promises);
			return result.map((expense) => {
				return {
					...expense,
					date: datetime.format(expense.date, "yyyy-MM-dd"),
				} as ExpenseWithClientConvertedSchema;
			});
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
	return queryOptions<{ rate: number; inverse_rate: number }>({
		queryKey: exchangeRateKeys.pair({ from, to }),
		queryFn: () => apiClient.exchangeRates.find({ from, to }),
		staleTime: TIME_IN_MILLISECONDS.DAY,
		select: (data) => ({ rate: data.rate, inverse_rate: data.inverse_rate }),
		placeholderData: { rate: 1, inverse_rate: 1 },
		throwOnError: true,
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
	});
};
