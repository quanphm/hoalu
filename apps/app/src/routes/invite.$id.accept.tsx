import { SuperCenteredLayout } from "@/components/layouts/super-centered-layout";
import { WorkspaceAvatar } from "@/components/workspace-avatar";
import { useAuth } from "@/hooks/useAuth";
import { authClient } from "@/lib/auth-client";
import { invitationKeys, memberKeys } from "@/services/query-key-factory";
import { invitationDetailsOptions } from "@/services/query-options";
import { Button } from "@hoalu/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@hoalu/ui/card";
import { toast } from "@hoalu/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/invite/$id/accept")({
	loader: async ({ context: { queryClient }, params: { id } }) => {
		return queryClient.ensureQueryData(invitationDetailsOptions(id));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = useAuth();
	const invitation = Route.useLoaderData();
	const params = Route.useParams();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const mutation = useMutation({
		mutationFn: async () => {
			const { data, error } = await authClient.workspace.acceptInvitation({
				invitationId: params.id,
			});
			if (error) {
				throw error;
			}
			return data;
		},
		onSuccess: (data) => {
			toast.success("🎉 Invite accepted", {
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

	if (!invitation) {
		return (
			<SuperCenteredLayout>
				<Card className="select-none text-center">
					<CardHeader>
						<CardTitle className="text-xl">Something went wrong</CardTitle>
					</CardHeader>
					<CardContent>
						<p>We couldn't find this invite</p>
					</CardContent>
					<CardFooter>
						<Button variant="outline" className="w-full" asChild>
							<Link to="/">Go back</Link>
						</Button>
					</CardFooter>
				</Card>
			</SuperCenteredLayout>
		);
	}

	return (
		<SuperCenteredLayout>
			<Card className="select-none text-center">
				<CardHeader>
					<CardTitle className="flex flex-col items-center justify-center gap-4 text-xl">
						<WorkspaceAvatar
							size="lg"
							logo={invitation.workspaceLogo}
							name={invitation.workspaceName}
						/>
						{invitation.inviterName} has invited you to {invitation.workspaceName}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<hr />
					{user && <p className="mt-6">This invite was sent to</p>}
					{!user && <p className="mt-6">To accept the invitation please login as</p>}
					<p>
						<strong>{invitation.recipient}</strong>
					</p>
				</CardContent>
				<CardFooter className="flex justify-center">
					{user && invitation.status === "pending" && (
						<Button
							className="px-16"
							onClick={() => {
								mutation.mutateAsync();
							}}
							disabled={mutation.isPending}
						>
							Accept
						</Button>
					)}
					{!user && (
						<Button className="px-16" asChild>
							<Link
								to="/login"
								search={{
									redirect: location.href,
								}}
							>
								Login
							</Link>
						</Button>
					)}
				</CardFooter>
			</Card>
		</SuperCenteredLayout>
	);
}
