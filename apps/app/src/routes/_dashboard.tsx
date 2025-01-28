import { SidebarSaysLayout } from "@/components/layouts/sidebar-says-layout";
import { listWorkspacesOptions } from "@/lib/query-options";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard")({
	beforeLoad: async ({ context: { user } }) => {
		if (!user) {
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
			<Outlet />
		</SidebarSaysLayout>
	);
}
