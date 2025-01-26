import { PageContent } from "@/components/layouts/page-content";
import { User } from "@/components/user";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PageContent className="overflow-hidden">
			<User />
		</PageContent>
	);
}
