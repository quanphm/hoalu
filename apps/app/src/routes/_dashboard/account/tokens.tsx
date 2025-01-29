import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/account/tokens")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_dashboard/settings/api-keys"!</div>;
}
