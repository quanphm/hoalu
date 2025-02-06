import { SettingCard } from "@/components/cards";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { DeleteWorkspaceDialog, DeleteWorkspaceTrigger } from "@/components/workspace";
import { UpdateWorkspaceForm } from "@/components/workspace";
import { WorkspaceAvatar } from "@/components/workspace-avatar";
import { getWorkspaceDetailsOptions } from "@/services/query-options";
import { Button } from "@hoalu/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));

	return (
		<>
			<Section>
				<SectionHeader>
					<SectionTitle>General</SectionTitle>
				</SectionHeader>
				<SectionContent columns={3}>
					<SettingCard
						layout="horizontal"
						title="Logo"
						description={
							<p className="max-w-sm">
								Square image recommended.
								<br />
								Accepted file types: .png, .jpg. Max file size: 2MB.
							</p>
						}
						className="col-span-2"
					>
						<WorkspaceAvatar size="lg" logo={workspace.logo} name={workspace.name} />
					</SettingCard>
				</SectionContent>
				<SectionContent columns={3}>
					<SettingCard title="Profile" className="col-span-2">
						<UpdateWorkspaceForm />
					</SettingCard>
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitle className="text-destructive">Danger zone</SectionTitle>
				</SectionHeader>
				<SectionContent columns={3}>
					<SettingCard
						variant="destructive"
						layout="horizontal"
						title="Delete workspace"
						description="Permanently delete workspace. This action cannot be undone, so please be certain."
						className="col-span-2"
					>
						<DeleteWorkspaceDialog>
							<DeleteWorkspaceTrigger>
								<Button variant="destructive">Delete workspace</Button>
							</DeleteWorkspaceTrigger>
						</DeleteWorkspaceDialog>
					</SettingCard>
				</SectionContent>
			</Section>
		</>
	);
}
