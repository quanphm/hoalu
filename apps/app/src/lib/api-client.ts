import type { ExpensePayloadSchema } from "@/lib/schema";
import type { ApiRoutes } from "@hoalu/api/types";
import { hc } from "hono/client";

const honoClient = hc<ApiRoutes>(`${import.meta.env.PUBLIC_API_URL}`, {
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
	create: async (slug: string, json: ExpensePayloadSchema) => {
		const response = await honoClient.api.expenses.$post({
			query: { workspaceIdOrSlug: slug },
			json,
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

export const apiClient = {
	tasks,
	wallets,
	categories,
	expenses,
};
