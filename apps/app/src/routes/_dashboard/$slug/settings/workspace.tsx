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
import { useFilesUpload } from "@/hooks/use-files-upload";
import { useWorkspace } from "@/hooks/use-workspace";
import { apiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { useEditWorkspace } from "@/services/mutations";
import { getActiveMemberOptions } from "@/services/query-options";
import { Button } from "@hoalu/ui/button";
import { toast } from "@hoalu/ui/sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/settings/workspace")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const workspace = useWorkspace();
	const mutation = useEditWorkspace();
	const { data: member } = useSuspenseQuery(getActiveMemberOptions(slug));
	const {
		data: { previewUrls },
		fileInputRef,
		handleBrowseFiles,
		handleFileChange,
	} = useFilesUpload({
		onUpload: handleUpload,
	});

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

	async function handleUpload(files: File[]) {
		try {
			const result = await apiClient.images.uploadWithPresignedUrl(files[0]);
			await mutation.mutateAsync({
				payload: {
					name: workspace.name,
					slug: workspace.slug,
					logo: result.path,
				},
			});
		} catch (error) {
			if (error instanceof Error) {
				toast.error("Update workspace picture failed", {
					description: error.message,
				});
			}
		}
	}

	return (
		<>
			<Section>
				<SectionHeader>
					<SectionTitle>General</SectionTitle>
				</SectionHeader>
				<SectionContent columns={12}>
					<div className="col-span-8">
						<SectionContent>
							<SettingCard title="Profile">
								<EditWorkspaceForm canEdit={canUpdateWorkspace} />
							</SettingCard>
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
								<Button
									variant="outline"
									size="icon"
									className="size-14"
									onClick={handleBrowseFiles}
								>
									<WorkspaceAvatar
										size="lg"
										logo={previewUrls[0] ?? workspace.logo}
										name={workspace.name}
									/>
								</Button>
								<input
									type="file"
									ref={fileInputRef}
									onChange={handleFileChange}
									className="hidden"
									accept="image/*"
									aria-label="Upload image file"
								/>
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
