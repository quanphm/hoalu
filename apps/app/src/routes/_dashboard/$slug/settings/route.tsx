import { Tabs, TabsList, TabsTrigger } from "@hoalu/ui/tabs";
import { Link, Outlet, createFileRoute, useChildMatches, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/settings")({
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
					<TabsTrigger value="workspace" asChild>
						<Link to="/$slug/settings/workspace" params={{ slug }}>
							Workspace
						</Link>
					</TabsTrigger>
					<TabsTrigger value="members" asChild>
						<Link to="/$slug/settings/members" params={{ slug }}>
							Members
						</Link>
					</TabsTrigger>
					<TabsTrigger value="library" asChild>
						<Link to="/$slug/settings/library" params={{ slug }}>
							Library
						</Link>
					</TabsTrigger>
					<TabsTrigger value="photos" asChild>
						<Link to="/$slug/settings/photos" params={{ slug }}>
							Photos
						</Link>
					</TabsTrigger>
				</TabsList>
			</Tabs>
			<Outlet />
		</>
	);
}
