import { apiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import type { ExpensePayloadSchema, WorkspaceFormSchema } from "@/lib/schema";
import { toast } from "@hoalu/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { expenseKeys, invitationKeys, memberKeys, workspaceKeys } from "./query-key-factory";

const routeApi = getRouteApi("/_dashboard/$slug");

export function useCreateWorkspace() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const mutation = useMutation({
		mutationFn: async (value: WorkspaceFormSchema) => {
			const { data, error } = await authClient.workspace.create(value);
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

export function useUpdateWorkspace() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		mutationFn: async (value: WorkspaceFormSchema) => {
			const { data, error } = await authClient.workspace.update({
				data: {
					name: value.name,
					slug: value.slug,
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
			queryClient.invalidateQueries({ queryKey: workspaceKeys.withSlug(data.slug) });
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
			queryClient.removeQueries({ queryKey: memberKeys.activeWithSlug(data.slug) });
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
			toast.success(`Removed ${data.member.user.name}`);
			queryClient.invalidateQueries({ queryKey: workspaceKeys.withSlug(slug) });
			queryClient.invalidateQueries({ queryKey: memberKeys.activeWithSlug(slug) });
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
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	return mutation;
}

export function useCreateExpense() {
	const queryClient = useQueryClient();
	const { slug } = routeApi.useParams();
	const mutation = useMutation({
		throwOnError: true,
		mutationFn: async (payload: ExpensePayloadSchema) => {
			const result = await apiClient.expenses.create(slug, payload);
			return result;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: expenseKeys.all });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	return mutation;
}
