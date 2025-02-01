import { InviteDialog } from "@/components/invite-dialog";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { authClient } from "@/lib/auth-client";
import { MailPlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/members")({
	loader: async ({ context: { queryClient } }) => {},
	component: RouteComponent,
});

function RouteComponent() {
	const member = authClient.useActiveMember();
	const canInvite = authClient.workspace.checkRolePermission({
		role: member.data?.role || "member",
		permission: {
			invitation: ["create"],
		},
	});

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Members</SectionTitle>
				{canInvite && (
					<InviteDialog>
						<Button variant="outline" size="sm">
							<MailPlusIcon className="mr-2 size-4" />
							Invite
						</Button>
					</InviteDialog>
				)}
			</SectionHeader>
			<SectionContent>Content</SectionContent>
		</Section>
	);
}
