import { createFileRoute, Outlet } from "@tanstack/react-router";

import { SuperCenteredLayout } from "#app/components/layouts/super-centered-layout.tsx";

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
