import { SidebarSaysLayout } from "@/components/layouts/sidebar-says-layout";
import { listWorkspacesOptions, sessionOptions } from "@/services/query-options";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard")({
	beforeLoad: async ({ context: { queryClient } }) => {
		const auth = await queryClient.ensureQueryData(sessionOptions());
		console.log(auth);
		if (!auth || !auth.user) {
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
