import { SettingCard } from "@/components/cards";
import { DeleteWorkspaceDialog, DeleteWorkspaceTrigger } from "@/components/delete-workspace";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { Button } from "@hoalu/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/settings")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Section>
				<SectionHeader>
					<SectionTitle>General</SectionTitle>
				</SectionHeader>
				<SectionContent columns={1}>
					<SettingCard title="General">
						<DeleteWorkspaceDialog>
							<DeleteWorkspaceTrigger>
								<Button variant="destructive">Delete workspace</Button>
							</DeleteWorkspaceTrigger>
						</DeleteWorkspaceDialog>
					</SettingCard>
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitle className="text-destructive">Danger zone</SectionTitle>
				</SectionHeader>
				<SectionContent>
					<SettingCard
						variant="destructive"
						layout="horizontal"
						title="Delete workspace"
						description="Permanently delete workspace. This action cannot be undone."
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
