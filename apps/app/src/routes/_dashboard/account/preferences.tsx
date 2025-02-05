import { PageContent } from "@/components/layouts/page-content";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/account/preferences")({
	component: RouteComponent,
});

function RouteComponent() {
	return <PageContent>Hello "/_dashboard/account/preferences"!</PageContent>;
}
