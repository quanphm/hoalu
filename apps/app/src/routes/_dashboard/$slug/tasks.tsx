import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/tasks")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_dashboard/$slug/tasks"!</div>;
}
