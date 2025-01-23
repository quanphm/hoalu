import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/")({
	beforeLoad: async ({ context: { user } }) => {
		if (!user) {
			throw redirect({ to: "/login" });
		}
		const { data: workspace } = await authClient.workspace.list();
		if (!workspace || !workspace.length) {
			console.log("create workspace");
			return {};
		}

		const selectedWorkspace = workspace[0];
		authClient.workspace.setActive({
			workspaceId: selectedWorkspace.id,
		});

		throw redirect({ to: "" });
	},
	component: RouteComponent,
});

function RouteComponent() {
	return null;
}
