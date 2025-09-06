import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { ResponsiveLayout } from "@/components/layouts/responsive-layout";
import { DashboardActionProvider } from "@/components/providers/dashboard-action-provider";
import { DialogProvider } from "@/components/providers/dialog-provider";
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
		<DialogProvider>
			<ResponsiveLayout>
				<DashboardActionProvider>
					<Outlet />
				</DashboardActionProvider>
			</ResponsiveLayout>
		</DialogProvider>
	);
}
