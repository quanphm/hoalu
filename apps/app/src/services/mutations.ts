import { authClient } from "@/lib/auth-client";
import { toast } from "@hoalu/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { invitationKeys, memberKeys, workspaceKeys } from "./query-key-factory";

export function useRemoveMember(slug: string) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (id: number) => {
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
			queryClient.removeQueries({ queryKey: workspaceKeys.withSlug(slug) });
			queryClient.removeQueries({ queryKey: memberKeys.activeWithSlug(slug) });
			queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
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
			queryClient.invalidateQueries({ queryKey: memberKeys.activeWithSlug(data.workspace.slug) });

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
