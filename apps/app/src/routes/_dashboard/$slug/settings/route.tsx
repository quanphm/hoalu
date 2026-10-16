import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SettingsNav } from "#app/components/layouts/settings-nav.tsx";
import { getActiveMemberOptions } from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug/settings")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		queryClient.ensureQueryData(getActiveMemberOptions(slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		// The child routes each render a <Toolbar/> and a <PageContent/> as
		// siblings, so the outlet needs to sit inside one grid item of its own —
		// otherwise the fragment's children each become a grid cell.
		<div className="grid items-start gap-6 p-6 md:grid-cols-[13rem_1fr]">
			<SettingsNav />
			<div className="min-w-0">
				<Outlet />
			</div>
		</div>
	);
}
