import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { SidebarSaysLayout } from "@/components/layouts/sidebar-says-layout";
import { ActionProvider } from "@/components/providers/action-provider";
import { listWorkspacesOptions, sessionOptions } from "@/services/query-options";

export const Route = createFileRoute("/_dashboard")({
	beforeLoad: async ({ context: { queryClient } }) => {
		const auth = await queryClient.ensureQueryData(sessionOptions());
		if (!auth?.user) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		}
	},
	loader: async ({ context: { queryClient } }) => {
		await queryClient.ensureQueryData(listWorkspacesOptions());
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<SidebarSaysLayout>
			<ActionProvider>
				<Outlet />
			</ActionProvider>
		</SidebarSaysLayout>
	);
}
