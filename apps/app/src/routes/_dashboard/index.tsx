import { createWorkspaceDialogAtom } from "#app/atoms/index.ts";
import { WorkspaceCard } from "#app/components/cards.tsx";
import { Greeting } from "#app/components/greeting.tsx";
import { PageContent } from "#app/components/layouts/page-content.tsx";
import {
	Section,
	SectionContent,
	SectionDescription,
	SectionHeader,
} from "#app/components/layouts/section.tsx";
import {
	Toolbar,
	ToolbarActions,
	ToolbarGroup,
	ToolbarSeparator,
	ToolbarTitle,
} from "#app/components/layouts/toolbar.tsx";
import { RedactedAmountToggle } from "#app/components/redacted-amount-toggle.tsx";
import { CreateWorkspaceForm, CreateWorkspaceTrigger } from "#app/components/workspace.tsx";
import {
	listWorkspaceSummariesOptions,
	listWorkspacesOptions,
} from "#app/services/query-options.ts";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Card } from "@hoalu/ui/card";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

export const Route = createFileRoute("/_dashboard/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());
	const { data: summaries } = useQuery(listWorkspaceSummariesOptions());
	const setDialog = useSetAtom(createWorkspaceDialogAtom);
	const summaryMap = new Map((summaries || []).map((s) => [s.id, s]));

	return (
		<>
			<Toolbar>
				<ToolbarGroup>
					<ToolbarTitle>Home</ToolbarTitle>
				</ToolbarGroup>
				{workspaces.length !== 0 && (
					<ToolbarActions>
						<CreateWorkspaceTrigger />
						<ToolbarSeparator />
						<RedactedAmountToggle />
					</ToolbarActions>
				)}
			</Toolbar>
			<PageContent className="gap-8 p-6">
				<Greeting />
				{workspaces.length === 0 ? (
					<Section className="gap-2">
						<SectionHeader>
							<h3 className="text-lg font-semibold">Create a new workspace</h3>
						</SectionHeader>
						<SectionContent columns={12}>
							<div className="col-span-6">
								<CreateWorkspaceForm />
							</div>
						</SectionContent>
					</Section>
				) : (
					<Section className="md:gap-2">
						<SectionHeader>
							<SectionDescription>Select a workspace to continue</SectionDescription>
						</SectionHeader>
						<SectionContent columns={3} className="grid-cols-1">
							{workspaces.map((ws) => {
								const summary = summaryMap.get(ws.id);
								return (
									<Link key={ws.id} to="/$slug" params={{ slug: ws.slug }} className="group h-full">
										<WorkspaceCard {...ws} summary={summary} />
									</Link>
								);
							})}
							<button type="button" onClick={() => setDialog({ state: true })}>
								<Card className="hover:border-foreground/40 h-full justify-center rounded-md border-dashed bg-transparent">
									<div className="flex flex-col items-center justify-center gap-3">
										<PlusIcon className="text-muted-foreground size-4" />
										<span className="text-muted-foreground text-sm">New workspace</span>
									</div>
								</Card>
							</button>
						</SectionContent>
					</Section>
				)}
			</PageContent>
		</>
	);
}
