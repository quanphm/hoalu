import { listWorkspacesOptions } from "@/lib/query-options";
import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug")({
	beforeLoad: async ({ context: { queryClient }, params: { slug } }) => {
		const workspaces = await queryClient.ensureQueryData(listWorkspacesOptions());
		if (!workspaces || workspaces.length === 0) {
			throw notFound();
		}
		const maybeWorkspace = workspaces.find((ws) => ws.slug === slug);
		if (!maybeWorkspace) {
			throw notFound();
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
