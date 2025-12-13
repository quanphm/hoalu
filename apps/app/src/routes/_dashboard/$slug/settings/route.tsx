import { createFileRoute, Link, Outlet, useChildMatches, useParams } from "@tanstack/react-router";

import { Tabs, TabsList, TabsTrigger } from "@hoalu/ui/tabs";

import { getActiveMemberOptions } from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug/settings")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		await queryClient.ensureQueryData(getActiveMemberOptions(slug));
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = useParams({ from: "/_dashboard/$slug/settings" });
	const childMatches = useChildMatches();
	const currentMatch = childMatches[0].fullPath.split("/").slice(-1).join("");

	return (
		<>
			<Tabs value={currentMatch || "workspace"}>
				<TabsList>
					<TabsTrigger value="workspace">
						<Link to="/$slug/settings/workspace" params={{ slug }}>
							Workspace
						</Link>
					</TabsTrigger>
					<TabsTrigger value="members">
						<Link to="/$slug/settings/members" params={{ slug }}>
							Members
						</Link>
					</TabsTrigger>
				</TabsList>
			</Tabs>

			<Outlet />
		</>
	);
}
