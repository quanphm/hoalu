import { SettingCard } from "@/components/cards";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { DeleteWorkspaceDialog, DeleteWorkspaceTrigger } from "@/components/workspace";
import { UpdateWorkspaceForm } from "@/components/workspace";
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
				<SectionContent columns={3}>
					<SettingCard title="Logo" className="col-span-2">
						Logo
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
