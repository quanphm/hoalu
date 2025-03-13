/**
 * @see - Fundamental - https://tanstack.com/query/v4/docs/framework/react/guides/query-keys#query-keys-are-hashed-deterministically
 * @see - https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories
 */

import type { ExchangeRatesPayloadSchema } from "@/lib/schema";

export const authKeys = {
	session: ["session"] as const,
};

export const workspaceKeys = {
	all: ["workspaces"] as const,
	withSlug: (slug: string) => [...workspaceKeys.all, slug] as const,
};

export const memberKeys = {
	all: ["members"] as const,
	withWorkspace: (slug: string) => [...memberKeys["~active"](), slug] as const,
	"~active": () => [...memberKeys.all, "active"] as const,
};

export const invitationKeys = {
	all: ["invitations"] as const,
	withId: (id: string) => [...invitationKeys.all, id] as const,
};

export const walletKeys = {
	all: ["wallets"] as const,
	withWorkspace: (slug: string) => [...walletKeys.all, slug] as const,
	withId: (slug: string, id: string) => [...walletKeys.withWorkspace(slug), "id", id] as const,
};

export const categoryKeys = {
	all: ["categories"] as const,
	withWorkspace: (slug: string) => [...categoryKeys.all, slug] as const,
};

export const expenseKeys = {
	all: ["expenses"] as const,
	withWorkspace: (slug: string) => [...expenseKeys.all, slug] as const,
};

export const taskKeys = {
	all: ["tasks"] as const,
	withWorkspace: (slug: string) => [...taskKeys.all, slug] as const,
};

export const exchangeRateKeys = {
	all: ["exchange-rates"] as const,
	pair: ({ from = "USD", to }: ExchangeRatesPayloadSchema) =>
		[...exchangeRateKeys.all, from, to] as const,
};
