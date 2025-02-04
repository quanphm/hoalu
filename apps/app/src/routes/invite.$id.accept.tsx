import { SuperCenteredLayout } from "@/components/layouts/super-centered-layout";
import { WorkspaceAvatar } from "@/components/workspace-avatar";
import { useAuth } from "@/hooks/useAuth";
import { useAcceptInvitation } from "@/services/mutations";
import { invitationDetailsOptions } from "@/services/query-options";
import { Button } from "@hoalu/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@hoalu/ui/card";
import { Link, createFileRoute } from "@tanstack/react-router";

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
	const mutation = useAcceptInvitation();

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
								mutation.mutateAsync(params.id);
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
