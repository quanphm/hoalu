import type {
	CategoryPatchSchema,
	CategoryPostSchema,
	ExchangeRatesQuerySchema,
	ExpensePatchSchema,
	ExpensePostSchema,
	WalletPatchSchema,
	WalletPostSchema,
} from "@/lib/schema";
import type { ApiRoutes } from "@hoalu/api/types";
import { hc } from "hono/client";

export const honoClient = hc<ApiRoutes>(`${import.meta.env.PUBLIC_API_URL}`, {
	init: {
		credentials: "include",
	},
});

const tasks = {
	list: async (slug: string) => {
		const response = await honoClient.api.tasks.$get({
			query: { workspaceIdOrSlug: slug },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
};

const wallets = {
	list: async (slug: string) => {
		const response = await honoClient.api.wallets.$get({
			query: { workspaceIdOrSlug: slug },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	create: async (slug: string, payload: WalletPostSchema) => {
		const response = await honoClient.api.wallets.$post({
			query: { workspaceIdOrSlug: slug },
			json: payload,
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	get: async (slug: string, id: string) => {
		const response = await honoClient.api.wallets[":id"].$get({
			query: { workspaceIdOrSlug: slug },
			param: { id },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	edit: async (slug: string, id: string, payload: WalletPatchSchema) => {
		const response = await honoClient.api.wallets[":id"].$patch({
			query: { workspaceIdOrSlug: slug },
			param: { id },
			json: payload,
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	delete: async (slug: string, id: string) => {
		const response = await honoClient.api.wallets[":id"].$delete({
			query: { workspaceIdOrSlug: slug },
			param: { id },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
};

const categories = {
	list: async (slug: string) => {
		const response = await honoClient.api.categories.$get({
			query: { workspaceIdOrSlug: slug },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	create: async (slug: string, payload: CategoryPostSchema) => {
		const response = await honoClient.api.categories.$post({
			query: { workspaceIdOrSlug: slug },
			json: payload,
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	get: async (slug: string, id: string) => {
		const response = await honoClient.api.categories[":id"].$get({
			query: { workspaceIdOrSlug: slug },
			param: { id },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	edit: async (slug: string, id: string, payload: CategoryPatchSchema) => {
		const response = await honoClient.api.categories[":id"].$patch({
			query: { workspaceIdOrSlug: slug },
			param: { id },
			json: payload,
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	delete: async (slug: string, id: string) => {
		const response = await honoClient.api.categories[":id"].$delete({
			query: { workspaceIdOrSlug: slug },
			param: { id },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
};

const expenses = {
	list: async (slug: string) => {
		const response = await honoClient.api.expenses.$get({
			query: { workspaceIdOrSlug: slug },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	create: async (slug: string, payload: ExpensePostSchema) => {
		const response = await honoClient.api.expenses.$post({
			query: { workspaceIdOrSlug: slug },
			json: payload,
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	get: async (slug: string, id: string) => {
		const response = await honoClient.api.expenses[":id"].$get({
			query: { workspaceIdOrSlug: slug },
			param: { id },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	edit: async (slug: string, id: string, payload: ExpensePatchSchema) => {
		const response = await honoClient.api.expenses[":id"].$patch({
			query: { workspaceIdOrSlug: slug },
			param: { id },
			json: payload,
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	delete: async (slug: string, id: string) => {
		const response = await honoClient.api.expenses[":id"].$delete({
			query: { workspaceIdOrSlug: slug },
			param: { id },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
};

const exchangeRates = {
	find: async ({ from = "USD", to }: ExchangeRatesQuerySchema) => {
		const response = await honoClient.api["exchange-rates"].$get({
			query: { from, to },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
};

export const apiClient = {
	tasks,
	wallets,
	categories,
	expenses,
	exchangeRates,
};
