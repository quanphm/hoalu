import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug")({
	beforeLoad: async ({ context: { authClient }, params: { slug } }) => {
		const { data: workspaces } = await authClient.workspace.list();
		if (!workspaces || workspaces.length === 0) {
			throw notFound();
		}
		const maybeWorkspace = workspaces.find((ws) => ws.slug === slug);
		if (!maybeWorkspace) {
			throw notFound();
		}
		await authClient.workspace.setActive({ workspaceId: maybeWorkspace.id });
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
