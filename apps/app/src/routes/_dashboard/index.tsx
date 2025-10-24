import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";

import { createWorkspaceDialogAtom } from "#app/atoms/index.ts";
import { WorkspaceCard } from "#app/components/cards.tsx";
import { Greeting } from "#app/components/greeting.tsx";
import { PageContent } from "#app/components/layouts/page-content.tsx";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { CreateWorkspaceForm } from "#app/components/workspace.tsx";
import { listWorkspacesOptions } from "#app/services/query-options.ts";

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
