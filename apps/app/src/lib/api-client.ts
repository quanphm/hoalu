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
	scanReceipt: async (slug: string, imageBase64: string) => {
		const response = await honoClient.bff.files["scan-receipt"].$post({
			query: { workspaceIdOrSlug: slug },
			json: { imageBase64 },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	parseVoice: async (slug: string, transcription: string) => {
		const response = await honoClient.bff.files["parse-voice"].$post({
			query: { workspaceIdOrSlug: slug },
			json: { transcription },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	getExpenseFiles: async (slug: string, expenseId: string) => {
		const response = await honoClient.bff.files.workspace.expense[":id"].$get({
			param: { id: expenseId },
			query: { workspaceIdOrSlug: slug },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	deleteExpenseFile: async (slug: string, expenseId: string, fileId: string) => {
		const response = await honoClient.bff.files.workspace.expense[":expenseId"].file[":fileId"].$delete({
			param: { expenseId, fileId },
			query: { workspaceIdOrSlug: slug },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		return true;
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

const recurringBills = {
	list: async (slug: string) => {
		const response = await honoClient.bff["recurring-bills"].$get({
			query: { workspaceIdOrSlug: slug },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	create: async (slug: string, payload: Record<string, unknown>) => {
		const response = await honoClient.bff["recurring-bills"].$post({
			query: { workspaceIdOrSlug: slug },
			json: payload as any,
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	edit: async (slug: string, id: string, payload: Record<string, unknown>) => {
		const response = await honoClient.bff["recurring-bills"][":id"].$patch({
			param: { id },
			query: { workspaceIdOrSlug: slug },
			json: payload as any,
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	listUpcoming: async (slug: string) => {
		const response = await honoClient.bff["recurring-bills"].upcoming.$get({
			query: { workspaceIdOrSlug: slug },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	getUnified: async (slug: string) => {
		const response = await honoClient.bff["recurring-bills"].unified.$get({
			query: { workspaceIdOrSlug: slug },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	archive: async (slug: string, id: string) => {
		const response = await honoClient.bff["recurring-bills"][":id"]["archive"].$post({
			param: { id },
			query: { workspaceIdOrSlug: slug },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	unarchive: async (slug: string, id: string) => {
		const response = await honoClient.bff["recurring-bills"][":id"]["unarchive"].$post({
			param: { id },
			query: { workspaceIdOrSlug: slug },
		});
		if (!response.ok) {
			const { message } = await response.json();
			throw new Error(message);
		}
		const { data } = await response.json();
		return data;
	},
	permanentDelete: async (slug: string, id: string) => {
		const response = await honoClient.bff["recurring-bills"][":id"].$delete({
			param: { id },
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

export const apiClient = {
	tasks,
	wallets,
	categories,
	expenses,
	exchangeRates,
	files,
	workspaces,
	recurringBills,
};
