import { createFileRoute, Link, Outlet, useChildMatches, useParams } from "@tanstack/react-router";

import { Tabs, TabsList, TabsTrigger } from "@hoalu/ui/tabs";

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
				<TabsList className="relative h-auto w-full justify-start gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border">
					<TabsTrigger
						value="workspace"
						className="overflow-hidden rounded-b-none border-x border-t bg-muted py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
						asChild
					>
						<Link to="/$slug/settings/workspace" params={{ slug }}>
							Workspace
						</Link>
					</TabsTrigger>
					<TabsTrigger
						value="members"
						className="overflow-hidden rounded-b-none border-x border-t bg-muted py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
						asChild
					>
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
