import { authClient } from "@/lib/auth-client";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/")({
	beforeLoad: async ({ context: { session } }) => {
		const { data: workspace } = await authClient.workspace.list();
		if (!workspace || workspace.length === 0) {
			throw redirect({ to: "/onboarding" });
		}

		const workspaceBySession = workspace.find((ws) => ws.id === session?.activeWorkspaceId);
		const selectedWorkspace = workspaceBySession || workspace[0];

		await authClient.workspace.setActive({ workspaceId: selectedWorkspace.id });

		return redirect({
			statusCode: HTTPStatus.codes.TEMPORARY_REDIRECT,
			to: "/ws/$slug",
			params: {
				slug: selectedWorkspace.slug,
			},
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	return null;
}
