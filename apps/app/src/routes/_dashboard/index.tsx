import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

import { PlusIcon } from "@hoalu/icons/lucide";
import { Card } from "@hoalu/ui/card";

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
		<PageContent className="gap-12">
			<Greeting />
			<Section>
				<SectionHeader>
					<SectionTitle>Workspaces</SectionTitle>
				</SectionHeader>
				<SectionContent columns={4}>
					{workspaces.map((ws) => (
						<Link key={ws.id} to="/$slug" params={{ slug: ws.slug }} className="h-full">
							<WorkspaceCard {...ws} />
						</Link>
					))}
					<button
						type="button"
						onClick={() => setDialog({ state: true })}
						className="h-full cursor-pointer text-left transition-colors"
					>
						<Card className="h-full justify-center border-dashed bg-muted/50 hover:border-foreground/40 hover:bg-muted">
							<div className="flex flex-col items-center justify-center gap-2">
								<PlusIcon className="size-5" />
								<span className="text-muted-foreground text-sm">Add another workspace</span>
							</div>
						</Card>
					</button>
				</SectionContent>
			</Section>
		</PageContent>
	);
}
