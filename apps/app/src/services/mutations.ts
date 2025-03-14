import { apiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import type {
	CategoryPatchSchema,
	CategoryPostSchema,
	ExpensePostSchema,
	WalletPatchSchema,
	WalletPostSchema,
	WorkspaceFormSchema,
	WorkspaceMetadataFormSchema,
} from "@/lib/schema";
import {
	categoryKeys,
	expenseKeys,
	invitationKeys,
	walletKeys,
	workspaceKeys,
} from "@/services/query-key-factory";
import { toast } from "@hoalu/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";

const routeApi = getRouteApi("/_dashboard/$slug");

/**
 * workspaces
 */

export function useCreateWorkspace() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const mutation = useMutation({
		mutationFn: async (value: WorkspaceFormSchema) => {
			const { data, error } = await authClient.workspace.create({
				name: value.name,
				slug: value.slug,
				metadata: {
					currency: value.currency,
				},
			});
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: (data) => {
			toast.success("Workspace created");
			queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
			navigate({
				to: "/$slug",
				params: {
					slug: data.slug,
				},
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	return mutation;
}

export function useEditWorkspace() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async (value: Omit<WorkspaceFormSchema, "currency">) => {
			const { data, error } = await authClient.workspace.update({
				data: {
					name: value.name,
					slug: value.slug === slug ? undefined : value.slug,
				},
				idOrSlug: slug,
			});
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: (data) => {
			toast.success("Workspace updated");
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
		mutationFn: async (value: WorkspaceMetadataFormSchema) => {
			const { data, error } = await authClient.workspace.update({
				data: {
					metadata: value,
				},
				idOrSlug: slug,
			});
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: () => {
			toast.success("Workspace updated");
			queryClient.invalidateQueries({ queryKey: workspaceKeys.withSlug(slug) });
		},
	});
	return mutation;
}

export function useDeleteWorkspace() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const mutation = useMutation({
		mutationFn: async (value: { confirm: string }) => {
			const { data, error } = await authClient.workspace.delete({ idOrSlug: value.confirm });
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: async (data) => {
			toast.success("Workspace deleted");
			queryClient.removeQueries({ queryKey: workspaceKeys.withSlug(data.slug) });
			queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
			navigate({ to: "/" });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	return mutation;
}

export function useRemoveMember() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async (id: string) => {
			const { data, error } = await authClient.workspace.removeMember({
				userId: id,
				idOrSlug: slug,
			});
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: async (data) => {
			toast.success(`${data.member.user.name} has been removed`);
			queryClient.invalidateQueries({ queryKey: workspaceKeys.withSlug(slug) });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	return mutation;
}

export function useAcceptInvitation() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const mutation = useMutation({
		mutationFn: async (id: string) => {
			const { data, error } = await authClient.workspace.acceptInvitation({
				invitationId: id,
			});
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: (data) => {
			toast.success(`Welcome to ${data.workspace.name}!`);
			queryClient.removeQueries({ queryKey: invitationKeys.withId(data.invitation.id) });
			navigate({
				to: "/$slug",
				params: {
					slug: data.workspace.slug,
				},
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	return mutation;
}

export function useCancelInvitation() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async (id: string) => {
			const { data, error } = await authClient.workspace.cancelInvitation({ invitationId: id });
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: (data) => {
			queryClient.removeQueries({ queryKey: invitationKeys.withId(data.id) });
			queryClient.invalidateQueries({ queryKey: workspaceKeys.withSlug(slug) });
		},
		onError: (error) => {
			toast.error(error.message);
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
			toast.success("Expense created");
			queryClient.invalidateQueries({ queryKey: expenseKeys.all(slug) });
		},
		onError: (error) => {
			toast.error(error.message);
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
		onSuccess: async () => {
			toast.success("Expense deleted");
			queryClient.invalidateQueries({ queryKey: expenseKeys.all(slug) });
		},
		onError: (error) => {
			toast.error(error.message);
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
			toast.success("Wallet created");
			queryClient.invalidateQueries({ queryKey: walletKeys.all(slug) });
		},
		onError: (error) => {
			toast.error(error.message);
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
			toast.success("Wallet updated");
			queryClient.invalidateQueries({ queryKey: walletKeys.all(slug) });
		},
		onError: (error) => {
			toast.error(error.message);
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
		onSuccess: async () => {
			toast.success("Wallet deleted");
			queryClient.invalidateQueries({ queryKey: walletKeys.all(slug) });
		},
		onError: (error) => {
			toast.error(error.message);
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
			toast.success("Category created");
			queryClient.invalidateQueries({ queryKey: categoryKeys.all(slug) });
		},
		onError: (error) => {
			toast.error(error.message);
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
			toast.success("Category updated");
			queryClient.invalidateQueries({ queryKey: walletKeys.all(slug) });
		},
		onError: (error) => {
			toast.error(error.message);
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
		onSuccess: async () => {
			toast.success("Category deleted");
			queryClient.invalidateQueries({ queryKey: walletKeys.all(slug) });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	return mutation;
}
