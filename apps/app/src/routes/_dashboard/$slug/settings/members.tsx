import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { MailPlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { InvitationsTable } from "@/components/invitations-table";
import { InviteDialog } from "@/components/invite";
import { MembersTable } from "@/components/members-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { useWorkspace } from "@/hooks/use-workspace";
import { authClient } from "@/lib/auth-client";
import { getActiveMemberOptions, listInvitationsOptions } from "@/services/query-options";

export const Route = createFileRoute("/_dashboard/$slug/settings/members")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const workspace = useWorkspace();
	const { data: member } = useSuspenseQuery(getActiveMemberOptions(slug));
	const { data: invitations } = useQuery(listInvitationsOptions(slug));

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

	const invitationTableData = invitations?.map((invite) => ({
		id: invite.id,
		email: invite.email,
		status: invite.status,
		expiresAt: invite.expiresAt,
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
					<Suspense>
						<InvitationsTable data={invitationTableData || []} />
					</Suspense>
				</SectionContent>
			</Section>
		</>
	);
}
