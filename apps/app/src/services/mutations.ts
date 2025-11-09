import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

import { toastManager } from "@hoalu/ui/toast";

import { createExpenseDialogAtom, draftExpenseAtom } from "#app/atoms/index.ts";
import type { ExpenseClient } from "#app/hooks/use-db.ts";
import { apiClient } from "#app/lib/api-client.ts";
import { authClient } from "#app/lib/auth-client.ts";
import {
	categoryKeys,
	expenseKeys,
	walletKeys,
	workspaceKeys,
} from "#app/lib/query-key-factory.ts";
import type {
	CategoryPatchSchema,
	CategoryPostSchema,
	ExpensePatchSchema,
	ExpensePostSchema,
	WalletPatchSchema,
	WalletPostSchema,
	WorkspaceFormSchema,
	WorkspaceMetadataFormSchema,
} from "#app/lib/schema.ts";
import { playConfirmSound, playDropSound } from "#app/lib/sound-effects.ts";

const routeApi = getRouteApi("/_dashboard/$slug");

/**
 * workspaces
 */

export function useCreateWorkspace() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const mutation = useMutation({
		mutationFn: async ({ payload }: { payload: WorkspaceFormSchema }) => {
			const { data, error } = await authClient.workspace.create({
				name: payload.name,
				slug: payload.slug,
				metadata: {
					currency: payload.currency,
				},
			});
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: (data) => {
			toastManager.add({
				title: "Workspace created.",
				type: "success",
			});
			queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
			navigate({
				to: "/$slug",
				params: {
					slug: data.slug,
				},
			});
		},
		onError: (error) => {
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

export function useEditWorkspace() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ payload }: { payload: Omit<WorkspaceFormSchema, "currency"> }) => {
			const { data, error } = await authClient.workspace.update({
				data: {
					name: payload.name,
					slug: payload.slug === slug ? undefined : payload.slug,
					logo: payload.logo || undefined,
				},
				idOrSlug: slug,
			});
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: (data) => {
			toastManager.add({
				title: "Workspace updated.",
				type: "success",
			});
			queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
			if (slug !== data.slug) {
				navigate({
					to: "/$slug/settings/workspace",
					params: {
						slug: data.slug,
					},
				});
			}
		},
	});
	return mutation;
}

export function useEditWorkspaceMetadata() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ payload }: { payload: WorkspaceMetadataFormSchema }) => {
			const { data, error } = await authClient.workspace.update({
				data: {
					metadata: payload,
				},
				idOrSlug: slug,
			});
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: () => {
			toastManager.add({
				title: "Workspace updated.",
				type: "success",
			});
			queryClient.invalidateQueries({ queryKey: workspaceKeys.withSlug(slug) });
		},
	});
	return mutation;
}

export function useDeleteWorkspace() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const mutation = useMutation({
		mutationFn: async ({ confirm }: { confirm: string }) => {
			const { data, error } = await authClient.workspace.delete({ idOrSlug: confirm });
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: async (data) => {
			toastManager.add({
				title: "Workspace deleted.",
				type: "success",
			});
			queryClient.removeQueries({ queryKey: workspaceKeys.withSlug(data.slug) });
			queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
			navigate({ to: "/" });
		},
		onError: (error) => {
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

export function useRemoveMember() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ id }: { id: string }) => {
			const { data, error } = await authClient.workspace.removeMember({
				userId: id,
				idOrSlug: slug,
			});
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: async () => {
			playDropSound();
			queryClient.removeQueries({ queryKey: workspaceKeys.all });
			queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
		},
		onError: (error) => {
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

export function useCancelInvitation() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ id }: { id: string }) => {
			const { data, error } = await authClient.workspace.cancelInvitation({ invitationId: id });
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: () => {
			playDropSound();
			queryClient.invalidateQueries({ queryKey: workspaceKeys.withSlug(slug) });
		},
		onError: (error) => {
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

/**
 * expenses
 */

export function useCreateExpense() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ payload }: { payload: ExpensePostSchema }) => {
			const result = await apiClient.expenses.create(slug, payload);
			return result;
		},
		onSuccess: () => {
			playConfirmSound();
			toastManager.add({
				title: "Expense created.",
				type: "success",
			});
			queryClient.invalidateQueries({ queryKey: expenseKeys.all(slug) });
		},
		onError: (error) => {
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

export function useEditExpense() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: ExpensePatchSchema }) => {
			const result = await apiClient.expenses.edit(slug, id, payload);
			return result;
		},
		onSuccess: () => {
			playConfirmSound();
			toastManager.add({
				title: "Expense updated.",
				type: "success",
			});
			queryClient.invalidateQueries({ queryKey: expenseKeys.all(slug) });
		},
		onError: (error) => {
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

export function useDeleteExpense() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ id }: { id: string }) => {
			const result = await apiClient.expenses.delete(slug, id);
			return result;
		},
		onSuccess: (rs) => {
			playDropSound();
			toastManager.add({
				title: "Expense deleted.",
				type: "success",
			});
			queryClient.removeQueries({ queryKey: expenseKeys.withId(slug, rs.id) });
			queryClient.invalidateQueries({ queryKey: expenseKeys.all(slug) });
		},
		onError: (error) => {
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

export function useDuplicateExpense() {
	const setDialog = useSetAtom(createExpenseDialogAtom);
	const setDraft = useSetAtom(draftExpenseAtom);

	const mutation = useMutation({
		mutationFn: async ({ sourceExpense }: { sourceExpense: ExpenseClient }) => {
			if (!sourceExpense) return;

			setDraft({
				title: sourceExpense.title,
				description: sourceExpense.description ?? "",
				date: new Date().toISOString(),
				transaction: {
					value: sourceExpense.amount,
					currency: sourceExpense.currency,
				},
				walletId: sourceExpense.wallet.id,
				categoryId: sourceExpense.category?.id ?? "",
				repeat: sourceExpense.repeat,
			});
			setDialog({ state: true });

			return sourceExpense;
		},
	});

	return mutation;
}

export function useUploadExpenseFiles() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({
			id,
			title,
			date,
			files,
		}: {
			id: string;
			title: string;
			date: string;
			files: File[];
		}) => {
			const ids = await Promise.all(
				files.map(async (file) => {
					const response = await apiClient.files.uploadWithPresignedUrl(slug, file, {
						tags: ["expense"],
						description: `${new Date(date)} - ${title}`,
					});
					return response.id;
				}),
			);
			await apiClient.files.createImageExpense(slug, id, { ids });
			return id;
		},
		onSuccess: (expenseId) => {
			queryClient.invalidateQueries({ queryKey: expenseKeys.withId(slug, expenseId) });
		},
		onError: (error) => {
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

/**
 * wallets
 */

export function useCreateWallet() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ payload }: { payload: WalletPostSchema }) => {
			const result = await apiClient.wallets.create(slug, payload);
			return result;
		},
		onSuccess: () => {
			playConfirmSound();
			toastManager.add({
				title: "Wallet created.",
				type: "success",
			});
			queryClient.invalidateQueries({ queryKey: walletKeys.all(slug) });
		},
		onError: (error) => {
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

export function useEditWallet() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: WalletPatchSchema }) => {
			const result = await apiClient.wallets.edit(slug, id, payload);
			return result;
		},
		onSuccess: () => {
			playConfirmSound();
			toastManager.add({
				title: "Wallet updated.",
				type: "success",
			});
			queryClient.invalidateQueries({ queryKey: walletKeys.all(slug) });
		},
		onError: (error) => {
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

export function useDeleteWallet() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ id }: { id: string }) => {
			const result = await apiClient.wallets.delete(slug, id);
			return result;
		},
		onSuccess: async (rs) => {
			playDropSound();
			toastManager.add({
				title: "Wallet deleted.",
				type: "success",
			});
			queryClient.removeQueries({ queryKey: walletKeys.withId(slug, rs.id) });
			queryClient.invalidateQueries({ queryKey: walletKeys.all(slug) });
		},
		onError: (error) => {
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

/**
 * categories
 */

export function useCreateCategory() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ payload }: { payload: CategoryPostSchema }) => {
			const result = await apiClient.categories.create(slug, payload);
			return result;
		},
		onSuccess: () => {
			playConfirmSound();
			toastManager.add({
				title: "Category created.",
				type: "success",
			});
			queryClient.invalidateQueries({ queryKey: categoryKeys.all(slug) });
		},
		onError: (error) => {
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

export function useEditCategory() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ id, payload }: { id: string; payload: CategoryPatchSchema }) => {
			const result = await apiClient.categories.edit(slug, id, payload);
			return result;
		},
		onSuccess: () => {
			playConfirmSound();
			toastManager.add({
				title: "Category updated.",
				type: "success",
			});
			queryClient.invalidateQueries({ queryKey: categoryKeys.all(slug) });
		},
		onError: (error) => {
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}

export function useDeleteCategory() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async ({ id }: { id: string }) => {
			const result = await apiClient.categories.delete(slug, id);
			return result;
		},
		onSuccess: async (rs) => {
			playDropSound();
			toastManager.add({
				title: "Category deleted.",
				type: "success",
			});
			queryClient.removeQueries({ queryKey: categoryKeys.withId(slug, rs.id) });
			queryClient.invalidateQueries({ queryKey: categoryKeys.all(slug) });
		},
		onError: (error) => {
			toastManager.add({
				title: "Uh oh! Something went wrong.",
				description: error.message,
				type: "error",
			});
		},
	});
	return mutation;
}
