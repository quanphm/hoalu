import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@hoalu/ui/button";
import { toastManager } from "@hoalu/ui/toast";

import { ContentCard, ErrorCard } from "#app/components/cards.tsx";
import { WorkspaceLogo } from "#app/components/workspace.tsx";
import { useAuth } from "#app/hooks/use-auth.ts";
import { authClient } from "#app/lib/auth-client.ts";

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
			toastManager.add({
				title: `Welcome to ${data.workspace.name}!`,
				type: "success",
			});
			navigate({
				to: "/$slug",
				params: {
					slug: data.workspace.slug,
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

	if (!invitation) {
		return (
			<ErrorCard
				error="We couldn't find this invite"
				footer={
					<Button variant="outline" className="w-full" render={<Link to="/" />}>
						Go back
					</Button>
				}
			/>
		);
	}

	return (
		<ContentCard
			className="text-center"
			title={
				<div className="flex justify-center">
					<WorkspaceLogo size="lg" logo={null} name={invitation.workspaceName} />
				</div>
			}
			description={`${invitation.inviterName} has invited you to ${invitation.workspaceName}`}
			content={
				<>
					{user && <p>This invite was sent to</p>}
					{!user && <p>To accept the invitation please login as</p>}
					<p>
						<strong>{invitation.recipient}</strong>
					</p>
				</>
			}
			footer={
				<>
					{user && invitation.status === "pending" && (
						<Button
							className="m-auto px-16"
							onClick={() => {
								mutation.mutateAsync({ id: params.id });
							}}
							disabled={mutation.isPending}
						>
							Accept
						</Button>
					)}
					{!user && (
						<Button
							className="m-auto px-16"
							render={
								<Link
									to="/login"
									search={{
										redirect: location.href,
									}}
								/>
							}
						>
							Login
						</Button>
					)}
				</>
			}
		/>
	);
}
