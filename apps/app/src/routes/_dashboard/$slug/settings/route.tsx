import { createFileRoute, Outlet } from "@tanstack/react-router";

import { getActiveMemberOptions } from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug/settings")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		await queryClient.ensureQueryData(getActiveMemberOptions(slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
