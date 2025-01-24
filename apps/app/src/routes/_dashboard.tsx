import { SidebarSaysLayout } from "@/components/layouts/sidebar-says-layout";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard")({
	beforeLoad: async ({ context: { user } }) => {
		if (!user) {
			throw redirect({ to: "/login" });
		}
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
