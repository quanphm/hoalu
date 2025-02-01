import { BasicCard, WorkspaceCard } from "@/components/cards";
import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { CreateWorkspaceForm } from "@/components/create-workspace-form";
import { Greeting } from "@/components/greeting";
import { PageContent } from "@/components/layouts/page-content";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { listWorkspacesOptions } from "@/services/query-options";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());

	if (workspaces.length === 0) {
		return (
			<PageContent className="gap-12">
				<Greeting />
				<Section>
					<SectionHeader>
						<h3 className="font-semibold text-lg">Create a new workspace</h3>
					</SectionHeader>
					<SectionContent>
						<div className="col-span-2">
							<p className="mb-6 text-muted-foreground text-sm">
								Workspaces are shared environments where members can interact with content together.
							</p>
							<CreateWorkspaceForm />
						</div>
					</SectionContent>
				</Section>
			</PageContent>
		);
	}

	return (
		<PageContent className="gap-10">
			<Greeting />
			<Section>
				<SectionHeader>
					<SectionTitle>Getting started</SectionTitle>
				</SectionHeader>
				<SectionContent columns={3}>
					<BasicCard
						title="Create workspace"
						content="Experience the power of AI in generating unique content."
					/>
					<BasicCard
						title="Finance tracking"
						content="Experience the power of AI in generating unique content."
					/>
					<BasicCard
						title="Group tasks"
						content="Let AI handle the proofreading of your documents."
					/>
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitle>Workspaces ({workspaces.length})</SectionTitle>
					<CreateWorkspaceDialog>
						<Button variant="outline" size="sm">
							<PlusIcon className="mr-2 size-4" />
							Create
						</Button>
					</CreateWorkspaceDialog>
				</SectionHeader>
				<SectionContent columns={3}>
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
