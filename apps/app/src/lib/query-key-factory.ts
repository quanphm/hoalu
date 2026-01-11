/**
 * @see - Fundamental - https://tanstack.com/query/v4/docs/framework/react/guides/query-keys#query-keys-are-hashed-deterministically
 * @see - https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories
 */

import type { ExchangeRatesQuerySchema } from "#app/lib/schema.ts";

export const authKeys = {
	session: ["session"] as const,
};

export const workspaceKeys = {
	all: ["workspaces"] as const,
	withSlug: (slug: string) => [...workspaceKeys.all, slug] as const,
	logo: (slug: string) => [...workspaceKeys.withSlug(slug), "logo"] as const,
	invitations: (slug: string) => [...workspaceKeys.withSlug(slug), "invitations"] as const,
	summaries: () => [...workspaceKeys.all, "summaries"] as const,
	summary: (id: string) => [...workspaceKeys.all, "summary", id] as const,
};

export const memberKeys = {
	all: (slug: string) => memberKeys["~active"](slug),
	"~active": (slug: string) => [...memberKeys["~withWorkspace"](slug), "active"] as const,
	"~withWorkspace": (slug: string) => [...workspaceKeys.withSlug(slug), "members"] as const,
};

export const walletKeys = {
	all: (slug: string) => walletKeys["~withWorkspace"](slug),
	withId: (slug: string, id: string) => [...walletKeys.all(slug), "id", id] as const,
	"~withWorkspace": (slug: string) => [...workspaceKeys.withSlug(slug), "wallets"] as const,
};

export const categoryKeys = {
	all: (slug: string) => categoryKeys["~withWorkspace"](slug),
	withId: (slug: string, id: string) => [...categoryKeys.all(slug), "id", id] as const,
	"~withWorkspace": (slug: string) => [...workspaceKeys.withSlug(slug), "categories"] as const,
};

export const expenseKeys = {
	all: (slug: string) => expenseKeys["~withWorkspace"](slug),
	withId: (slug: string, id: string) => [...expenseKeys.all(slug), "id", id] as const,
	"~withWorkspace": (slug: string) => [...workspaceKeys.withSlug(slug), "expenses"] as const,
};

export const taskKeys = {
	all: (slug: string) => taskKeys["~withWorkspace"](slug),
	withId: (slug: string, id: string) => [...taskKeys.all(slug), "id", id] as const,
	"~withWorkspace": (slug: string) => [...workspaceKeys.withSlug(slug), "tasks"] as const,
};

export const fileKeys = {
	all: (slug: string) => fileKeys["~withWorkspace"](slug),
	withId: (slug: string, id: string) => [...fileKeys.all(slug), "id", id] as const,
	"~withWorkspace": (slug: string) => [...workspaceKeys.withSlug(slug), "files"] as const,
};

export const exchangeRateKeys = {
	all: ["exchange-rates"] as const,
	pair: ({ from = "USD", to }: ExchangeRatesQuerySchema) =>
		[...exchangeRateKeys.all, { from, to }] as const,
};
