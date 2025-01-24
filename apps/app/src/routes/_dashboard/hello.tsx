import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/hello")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_dashboard/hello"!</div>;
}
