import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/settings/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	return <Navigate to="/$slug/settings/workspace" params={{ slug }} replace />;
}
