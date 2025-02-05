import { authClient } from "@/lib/auth-client";
import { toast } from "@hoalu/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { invitationKeys, memberKeys, workspaceKeys } from "./query-key-factory";

export function useRemoveMember(slug: string) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
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
		onSuccess: (data) => {
			toast.success(`Removed ${data.member.user.name}`);
			queryClient.invalidateQueries({ queryKey: workspaceKeys.all });
			queryClient.invalidateQueries({ queryKey: memberKeys.all });
			navigate({ to: "/" });
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
			toast.success("Invite accepted", {
				description: `Welcome to ${data.workspace.name}!`,
			});
			queryClient.invalidateQueries({ queryKey: memberKeys.all });
			queryClient.invalidateQueries({ queryKey: invitationKeys.all });
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
