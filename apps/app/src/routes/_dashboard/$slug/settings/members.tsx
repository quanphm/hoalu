import { InvitationsTable } from "@/components/invitations-table";
import { InviteDialog } from "@/components/invite";
import { MembersTable } from "@/components/members-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { authClient } from "@/lib/auth-client";
import { getActiveMemberOptions, getWorkspaceDetailsOptions } from "@/services/query-options";
import { MailPlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/settings/members")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));
	const { data: member } = useSuspenseQuery(getActiveMemberOptions(slug));
	const canInvite = authClient.workspace.checkRolePermission({
		// @ts-expect-error: [todo] fix role type
		role: member.role,
		permission: {
			invitation: ["create"],
		},
	});
	const membersTableData = workspace.members.map((member) => ({
		id: member.user.id,
		name: member.user.name,
		email: member.user.email,
		image: member.user.image,
		role: member.role,
	}));
	const invitationTableData = workspace.invitations
		//.filter((invite) => invite.status !== "accepted")
		.filter((invite) => invite.status === "pending")
		.map((invite) => ({
			id: invite.id,
			email: invite.email,
			status: invite.status,
		}));

	return (
		<>
			<Section>
				<SectionHeader>
					<SectionTitle>Members</SectionTitle>
					{canInvite && (
						<InviteDialog>
							<Button variant="outline" size="sm">
								<MailPlusIcon className="mr-2 size-4" />
								Invite people
							</Button>
						</InviteDialog>
					)}
				</SectionHeader>
				<SectionContent>
					<MembersTable data={membersTableData} />
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitle>Invitations</SectionTitle>
				</SectionHeader>
				<SectionContent>
					<InvitationsTable data={invitationTableData} />
				</SectionContent>
			</Section>
		</>
	);
}
