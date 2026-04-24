import { PageContent } from "#app/components/layouts/page-content.tsx";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/_normal")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PageContent className="gap-0! p-0!">
			<Outlet />
		</PageContent>
	);
}
