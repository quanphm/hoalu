import { PageContent } from "#app/components/layouts/page-content.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/account/tokens")({
	component: RouteComponent,
});

function RouteComponent() {
	return <PageContent>Hello "/_dashboard/settings/api-keys"!</PageContent>;
}
