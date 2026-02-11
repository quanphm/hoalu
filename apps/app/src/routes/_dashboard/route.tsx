import { ResponsiveLayout } from "#app/components/layouts/responsive-layout.tsx";
import { DashboardActionProvider } from "#app/components/providers/dashboard-action-provider.tsx";
import { DialogProvider } from "#app/components/providers/dialog-provider.tsx";
import { listWorkspacesOptions, sessionOptions } from "#app/services/query-options.ts";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

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
