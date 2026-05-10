import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/_toolbar-and-queue/transactions/")({
	component: RouteComponent,
});

function RouteComponent() {
	return null;
}
