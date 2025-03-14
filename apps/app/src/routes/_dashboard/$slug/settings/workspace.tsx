import { SettingCard } from "@/components/cards";
import { InputWithCopy } from "@/components/input-with-copy";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import {
	DeleteWorkspaceDialog,
	DeleteWorkspaceTrigger,
	EditWorkspaceForm,
	EditWorkspaceMetadataForm,
} from "@/components/workspace";
import { WorkspaceAvatar } from "@/components/workspace";
import { authClient } from "@/lib/auth-client";
import { getActiveMemberOptions, getWorkspaceDetailsOptions } from "@/services/query-options";
import { Button } from "@hoalu/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/settings/workspace")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));
	const { data: member } = useSuspenseQuery(getActiveMemberOptions(slug));

	const canDeleteWorkspace = authClient.workspace.checkRolePermission({
		// @ts-expect-error: [todo] fix role type
		role: member.role,
		permission: {
			organization: ["delete"],
		},
	});

	const canUpdateWorkspace = authClient.workspace.checkRolePermission({
		// @ts-expect-error: [todo] fix role type
		role: member.role,
		permission: {
			organization: ["update"],
		},
	});

	return (
		<>
			<Section>
				<SectionHeader>
					<SectionTitle>General</SectionTitle>
				</SectionHeader>
				<SectionContent columns={12}>
					<div className="col-span-8">
						<SectionContent>
							<SettingCard
								layout="horizontal"
								title="Logo"
								description={
									<p className="max-w-sm">
										Recommended size 256x256px.
										<br />
										Accepted file types: .png, .jpg. Max file size: 5MB.
									</p>
								}
							>
								<WorkspaceAvatar size="lg" logo={workspace.logo} name={workspace.name} />
							</SettingCard>
							<SettingCard title="Profile">
								<EditWorkspaceForm canEdit={canUpdateWorkspace} />
							</SettingCard>
							<SettingCard title="Workspace ID">
								<InputWithCopy value={workspace.publicId} />
							</SettingCard>
						</SectionContent>
					</div>

					<div className="col-span-4">
						<SettingCard title="Preferences">
							<EditWorkspaceMetadataForm canEdit={canUpdateWorkspace} />
						</SettingCard>
					</div>
				</SectionContent>
			</Section>

			{canDeleteWorkspace && (
				<Section>
					<SectionHeader>
						<SectionTitle className="text-destructive">Danger zone</SectionTitle>
					</SectionHeader>
					<SectionContent columns={12}>
						<SettingCard
							variant="destructive"
							layout="horizontal"
							title="Delete workspace"
							description="Permanently delete workspace. This action can't be undone, so please be certain."
							className="col-span-8"
						>
							<DeleteWorkspaceDialog>
								<DeleteWorkspaceTrigger>
									<Button variant="destructive">Delete workspace</Button>
								</DeleteWorkspaceTrigger>
							</DeleteWorkspaceDialog>
						</SettingCard>
					</SectionContent>
				</Section>
			)}
		</>
	);
}
