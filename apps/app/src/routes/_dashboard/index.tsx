import { WorkspaceCard } from "@/components/cards";
import { Greeting } from "@/components/greeting";
import { PageContent } from "@/components/layouts/page-content";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { CreateWorkspaceDialog, CreateWorkspaceDialogTrigger } from "@/components/workspace";
import { CreateWorkspaceForm } from "@/components/workspace";
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
					<CreateWorkspaceDialog>
						<CreateWorkspaceDialogTrigger>
							<Button variant="outline" size="sm">
								<PlusIcon className="mr-2 size-4" />
								Create
							</Button>
						</CreateWorkspaceDialogTrigger>
					</CreateWorkspaceDialog>
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
