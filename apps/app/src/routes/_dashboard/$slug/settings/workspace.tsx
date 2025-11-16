import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

import { Button } from "@hoalu/ui/button";
import { toastManager } from "@hoalu/ui/toast";

import { deleteWorkspaceDialogAtom } from "#app/atoms/index.ts";
import { SettingCard } from "#app/components/cards.tsx";
import { useFilesUpload } from "#app/components/files/use-files-upload.ts";
import { InputWithCopy } from "#app/components/input-with-copy.tsx";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import {
	EditWorkspaceForm,
	EditWorkspaceMetadataForm,
	WorkspaceLogo,
} from "#app/components/workspace.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { apiClient } from "#app/lib/api-client.ts";
import { authClient } from "#app/lib/auth-client.ts";
import { useEditWorkspace } from "#app/services/mutations.ts";
import { getActiveMemberOptions, workspaceLogoOptions } from "#app/services/query-options.ts";

export const Route = createFileRoute("/_dashboard/$slug/settings/workspace")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const workspace = useWorkspace();
	const mutation = useEditWorkspace();
	const { data: logo } = useQuery(workspaceLogoOptions(workspace.slug, workspace.logo));
	const { data: member } = useSuspenseQuery(getActiveMemberOptions(slug));
	const {
		data: { previewUrls },
		fileInputRef,
		handleBrowseFiles,
		handleFileChange,
	} = useFilesUpload({
		onUpload: handleUploadLogo,
	});

	const setDialog = useSetAtom(deleteWorkspaceDialogAtom);

	const canDeleteWorkspace = authClient.workspace.checkRolePermission({
		role: member.role as "member" | "admin" | "owner",
		permission: {
			organization: ["delete"],
		},
	});

	const canUpdateWorkspace = authClient.workspace.checkRolePermission({
		role: member.role as "member" | "admin" | "owner",
		permission: {
			organization: ["update"],
		},
	});

	async function handleUploadLogo(files: File[]) {
		try {
			const result = await apiClient.files.uploadWithPresignedUrl(workspace.slug, files[0], {
				tags: ["logo"],
			});
			await mutation.mutateAsync({
				payload: {
					name: workspace.name,
					slug: workspace.slug,
					logo: result.path,
				},
			});
		} catch (error) {
			if (error instanceof Error) {
				toastManager.add({
					title: "Uh oh! Something went wrong.",
					description: error.message,
					type: "error",
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
							<SettingCard title="Workspace ID">
								<InputWithCopy value={workspace.publicId} />
							</SettingCard>
						</SectionContent>
					</div>
					<div className="col-span-4">
						<SectionContent>
							<SettingCard title="Logo">
								<div className="flex items-center gap-4">
									<Button
										variant="outline"
										size="icon"
										className="size-14 rounded-full border-0"
										onClick={handleBrowseFiles}
									>
										<WorkspaceLogo size="lg" logo={previewUrls[0] ?? logo} name={workspace.name} />
									</Button>
									<p className="max-w-sm text-sm">
										Recommended size 256x256px. PNG or JPEG file. Max file size 5MB.
									</p>
								</div>
								{canUpdateWorkspace && (
									<input
										type="file"
										ref={fileInputRef}
										onChange={handleFileChange}
										className="hidden"
										accept="image/*"
										aria-label="Upload image file"
									/>
								)}
							</SettingCard>
							<SettingCard title="Preferences">
								<EditWorkspaceMetadataForm canEdit={canUpdateWorkspace} />
							</SettingCard>
						</SectionContent>
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
							title="Delete workspace"
							description="Permanently delete workspace. This action can't be undone, so please be certain."
							className="col-span-8"
						>
							<Button variant="destructive" onClick={() => setDialog({ state: true })}>
								Delete workspace
							</Button>
						</SettingCard>
					</SectionContent>
				</Section>
			)}
		</>
	);
}
