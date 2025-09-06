import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { createWorkspaceDialogAtom } from "@/atoms";
import { WorkspaceCard } from "@/components/cards";
import { Greeting } from "@/components/greeting";
import { PageContent } from "@/components/layouts/page-content";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/layouts/section";
import { CreateWorkspaceForm } from "@/components/workspace";
import { listWorkspacesOptions } from "@/services/query-options";

export const Route = createFileRoute("/_dashboard/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());
	const setDialog = useSetAtom(createWorkspaceDialogAtom);

	if (workspaces.length === 0) {
		return (
			<PageContent className="gap-12">
				<Greeting />
				<Section className="gap-2">
					<SectionHeader>
						<h3 className="font-semibold text-lg">Create a new workspace</h3>
					</SectionHeader>
					<SectionContent columns={12}>
						<div className="col-span-6">
							<CreateWorkspaceForm />
						</div>
					</SectionContent>
				</Section>
			</PageContent>
		);
	}

	return (
		<PageContent>
			<Greeting />
			<Section>
				<SectionHeader>
					<SectionTitle>Workspaces</SectionTitle>
					<Button variant="outline" size="sm" onClick={() => setDialog({ state: true })}>
						<PlusIcon className="mr-2 size-4" />
						Create
					</Button>
				</SectionHeader>
				<SectionContent columns={4}>
					{workspaces.map((ws) => (
						<Link key={ws.id} to="/$slug" params={{ slug: ws.slug }}>
							<WorkspaceCard {...ws} />
						</Link>
					))}
				</SectionContent>
			</Section>
		</PageContent>
	);
}
