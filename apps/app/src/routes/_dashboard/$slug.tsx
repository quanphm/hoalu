import { PageContent } from "@/components/layouts/page-content";
import { getFullWorkspaceOptions } from "@/lib/query-options";
import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		const workspace = await queryClient.ensureQueryData(getFullWorkspaceOptions(slug));
		if (!workspace) {
			throw notFound();
		}
		return {
			workspace,
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PageContent>
			<Outlet />
		</PageContent>
	);
}
