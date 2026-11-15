import { createFileRoute, Outlet } from "@tanstack/react-router";

import { getActiveMemberOptions } from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug/settings")({
	loader: ({ context: { queryClient }, params: { slug } }) => {
		return queryClient.ensureQueryData(getActiveMemberOptions(slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
