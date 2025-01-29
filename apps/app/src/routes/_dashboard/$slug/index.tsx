import { Chart } from "@/components/chart";
import { listWorkspacesOptions } from "@/lib/query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());
	const params = useParams({ strict: false });
	const currentWorkspace = workspaces.find((ws) => ws.slug === params.slug);
	console.log(currentWorkspace);

	return (
		<>
			<Chart />
		</>
	);
}
