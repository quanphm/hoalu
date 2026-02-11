import type {
	CategoryPatchSchema,
	CategoryPostSchema,
	ExchangeRatesQuerySchema,
	ExpensePatchSchema,
	ExpensePostSchema,
	FileMetaSchema,
	WalletPatchSchema,
	WalletPostSchema,
} from "#app/lib/schema.ts";
import type { ApiRoutes } from "@hoalu/api/types";
import { hc } from "hono/client";

export const honoClient = hc<ApiRoutes>(`${import.meta.env.PUBLIC_API_URL}`, {
	init: {
		credentials: "include",
	},
});

const tasks = {
	list: async (slug: string) => {
		const response = await honoClient.bff.tasks.$get({
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
		const response = await honoClient.bff.wallets.$get({
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
		const response = await honoClient.bff.wallets.$post({
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
		const response = await honoClient.bff.wallets[":id"].$get({
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
		const response = await honoClient.bff.wallets[":id"].$patch({
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
		const response = await honoClient.bff.wallets[":id"].$delete({
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
		const response = await honoClient.bff.categories.$get({
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
		const response = await honoClient.bff.categories.$post({
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
		const response = await honoClient.bff.categories[":id"].$get({
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
		const response = await honoClient.bff.categories[":id"].$patch({
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
		const response = await honoClient.bff.categories[":id"].$delete({
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
		const response = await honoClient.bff.expenses.$get({
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
		const response = await honoClient.bff.expenses.$post({
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
		const response = await honoClient.bff.expenses[":id"].$get({
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
		const response = await honoClient.bff.expenses[":id"].$patch({
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
		const response = await honoClient.bff.expenses[":id"].$delete({
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
		const response = await honoClient.bff["exchange-rates"].$get({
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

const files = {
	createPresignedUploadUrl: async (slug: string, payload: FileMetaSchema) => {
		const response = await honoClient.bff.files["generate-upload-url"].$post({
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
	uploadWithPresignedUrl: async (
		slug: string,
		file: File,
		meta?: Omit<FileMetaSchema, "name" | "size" | "type">,
	) => {
		const presignedData = await files.createPresignedUploadUrl(slug, {
			size: file.size,
			type: file.type,
			...meta,
		});
		await fetch(presignedData.uploadUrl, {
			method: "PUT",
			headers: {
				"Content-Type": file.type,
			},
			body: file,
		});
		return {
			id: presignedData.id,
			name: presignedData.name,
			path: presignedData.s3Url,
		};
	},
	createImageExpense: async (slug: string, id: string, payload: { ids: string[] }) => {
		const response = await honoClient.bff.files.workspace.expense[":id"].$post({
			param: { id },
			query: { workspaceIdOrSlug: slug },
			json: { ids: payload.ids },
		});
		if (response.status !== 201) {
			throw new Error("Upload failed");
		}
		return true;
	},
	getWorkspaceLogo: async (slug: string) => {
		const response = await honoClient.bff.files.workspace.logo.$get({
			query: { workspaceIdOrSlug: slug },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	getFiles: async (slug: string) => {
		const response = await honoClient.bff.files.workspace.$get({
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

const workspaces = {
	listSummaries: async () => {
		const response = await honoClient.bff.workspaces.summaries.$get();
		if (!response.ok) {
			throw new Error("Failed to fetch workspace summaries");
		}
		const { data } = await response.json();
		return data;
	},
	getSummary: async (id: string) => {
		const response = await honoClient.bff.workspaces[":id"].summary.$get({
			param: { id },
		});
		if (!response.ok) {
			throw new Error("Failed to fetch workspace summary");
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
	files,
	workspaces,
};
