import { Tabs, TabsList, TabsTrigger } from "@hoalu/ui/tabs";
import { Link, Outlet, createFileRoute, useChildMatches } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	const childMatches = useChildMatches();
	const currentMatch = childMatches[0].fullPath.split("/").slice(-1).join("");

	return (
		<>
			<Tabs value={currentMatch || "workspace"}>
				<TabsList>
					<TabsTrigger value="workspace" asChild>
						<Link from="/$slug/settings" to="./workspace">
							Workspace
						</Link>
					</TabsTrigger>
					<TabsTrigger value="members" asChild>
						<Link from="/$slug/settings" to="./members">
							Members
						</Link>
					</TabsTrigger>
				</TabsList>
			</Tabs>
			<Outlet />
		</>
	);
}
