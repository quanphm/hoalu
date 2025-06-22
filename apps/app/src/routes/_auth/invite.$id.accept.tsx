import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@hoalu/ui/button";
import { toast } from "@hoalu/ui/sonner";
import { ContentCard, ErrorCard } from "@/components/cards";
import { WorkspaceLogo } from "@/components/workspace";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/invite/$id/accept")({
	loader: async ({ params: { id } }) => {
		const { data } = await authClient.workspace.getInvitation({
			query: { id },
		});
		if (!data) return null;
		return data;
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { user } = useAuth();
	const invitation = Route.useLoaderData();
	const params = Route.useParams();
	const navigate = useNavigate();

	const mutation = useMutation({
		mutationFn: async ({ id }: { id: string }) => {
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
			<ErrorCard
				error="We couldn't find this invite"
				footer={
					<Button variant="outline" className="w-full" asChild>
						<Link to="/">Go back</Link>
					</Button>
				}
			/>
		);
	}

	return (
		<ContentCard
			title={<WorkspaceLogo size="lg" logo={null} name={invitation.workspaceName} />}
			description={`${invitation.inviterName} has invited you to {invitation.workspaceName}`}
			content={
				<>
					{user && <p className="mt-6">This invite was sent to</p>}
					{!user && <p className="mt-6">To accept the invitation please login as</p>}
					<p>
						<strong>{invitation.recipient}</strong>
					</p>
				</>
			}
			footer={
				<>
					{user && invitation.status === "pending" && (
						<Button
							className="px-16"
							onClick={() => {
								mutation.mutateAsync({ id: params.id });
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
				</>
			}
		/>
	);
}
