import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SuperCenteredLayout } from "@/components/layouts/super-centered-layout";

export const Route = createFileRoute("/_auth")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<SuperCenteredLayout>
			<Outlet />
		</SuperCenteredLayout>
	);
}
