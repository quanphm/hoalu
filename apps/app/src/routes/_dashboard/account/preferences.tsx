import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/account/preferences")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_dashboard/account/preferences"!</div>;
}
