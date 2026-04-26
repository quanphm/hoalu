import { getActiveMemberOptions } from "#app/services/query-options.ts";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/settings")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		queryClient.ensureQueryData(getActiveMemberOptions(slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
