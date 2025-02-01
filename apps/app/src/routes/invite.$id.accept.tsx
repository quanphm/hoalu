import { SuperCenteredLayout } from "@/components/layouts/super-centered-layout";
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
	const invitation = Route.useLoaderData();

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
					<CardTitle className="text-xl">
						{invitation.inviterEmail} has invited you to {invitation.workspaceName}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p>
						To accept the invitation please login as
						<br />
						<strong>{invitation.email}</strong>
					</p>
				</CardContent>
				<CardFooter>
					<Button className="w-full">Login</Button>
				</CardFooter>
			</Card>
		</SuperCenteredLayout>
	);
}
