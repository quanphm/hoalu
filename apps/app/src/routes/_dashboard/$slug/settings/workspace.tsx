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
import { useImageUpload } from "@/hooks/use-image-upload";
import { apiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";
import { getActiveMemberOptions, getWorkspaceDetailsOptions } from "@/services/query-options";
import { Button } from "@hoalu/ui/button";
import { toast } from "@hoalu/ui/sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/settings/workspace")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));
	const { data: member } = useSuspenseQuery(getActiveMemberOptions(slug));
	const {
		data: avatar,
		fileInputRef,
		handleThumbnailClick,
		handleFileChange,
	} = useImageUpload({
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

	async function handleUpload(file: File) {
		const result = await apiClient.images.createPresignedUploadUrl({ size: file.size });
		try {
			await fetch(result.uploadUrl, {
				method: "PUT",
				headers: {
					"Content-Type": file.type,
				},
				body: file,
			});
		} catch (error: any) {
			toast.error("Update workspace picture failed", {
				description: error.message,
			});
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
									onClick={handleThumbnailClick}
								>
									<WorkspaceAvatar
										size="lg"
										logo={avatar.preview ?? workspace.logo}
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
