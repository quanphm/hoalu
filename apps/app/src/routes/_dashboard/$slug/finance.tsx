import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/finance")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
