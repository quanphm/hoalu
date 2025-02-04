import { InviteDialog } from "@/components/invite";
import { MembersTable } from "@/components/members-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { authClient } from "@/lib/auth-client";
import { getActiveMemberOptions } from "@/services/query-options";
import { MailPlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { toast } from "@hoalu/ui/sonner";
import { createFileRoute, redirect, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/members")({
	loader: async ({ context: { queryClient }, params: { slug } }) => {
		const result = await queryClient.ensureQueryData(getActiveMemberOptions(slug));
		if (!result) {
			toast.error("Member not found");
			throw redirect({ to: "/" });
		}
		return result;
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { workspace } = useLoaderData({ from: "/_dashboard/$slug" });
	const member = Route.useLoaderData();
	const canInvite = authClient.workspace.checkRolePermission({
		role: member.role || "member",
		permission: {
			invitation: ["create"],
		},
	});

	const membersTableData = workspace.members.map((member) => ({
		id: member.user.publicId,
		name: member.user.name,
		email: member.user.email,
		image: member.user.image,
		role: member.role,
	}));

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

			<SectionContent columns={1}>
				<MembersTable data={membersTableData} />
			</SectionContent>
		</Section>
	);
}
