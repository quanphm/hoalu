import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { Frame } from "@hoalu/ui/frame";

import { InvitationsTable } from "#app/components/invitations-table.tsx";
import { InviteDialog } from "#app/components/invite.tsx";
import {
	Section,
	SectionAction,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { MembersTable } from "#app/components/members-table.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { authClient } from "#app/lib/auth-client.ts";
import { getActiveMemberOptions, listInvitationsOptions } from "#app/services/query-options.ts";

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
					<SectionAction>{canInvite && <InviteDialog />}</SectionAction>
				</SectionHeader>
				<SectionContent>
					<Frame>
						<MembersTable data={membersTableData} />
					</Frame>
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitle>Invitations</SectionTitle>
				</SectionHeader>
				<SectionContent>
					<Frame>
						<Suspense>
							<InvitationsTable data={invitationTableData || []} />
						</Suspense>
					</Frame>
				</SectionContent>
			</Section>
		</>
	);
}
