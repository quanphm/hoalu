import { InviteDialog } from "@/components/invite";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { UserAvatar } from "@/components/user-avatar";
import { authClient } from "@/lib/auth-client";
import { getActiveMemberOptions } from "@/services/query-options";
import { MailPlusIcon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
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
			<SectionContent columns={3} className="gap-6">
				{workspace.members.map((member) => (
					<div
						key={member.user.publicId}
						className="flex items-center gap-6 rounded-md border border-border bg-muted/50 p-3"
					>
						<div className="flex flex-1 items-center justify-between gap-2">
							<UserAvatar name={member.user.name} image={member.user.image} />
							<div className="grid flex-1 text-left text-sm">
								<span className="truncate font-semibold">{member.user.name}</span>
								<span className="truncate text-muted-foreground text-xs">{member.user.email}</span>
							</div>
						</div>
						{member.role === "owner" && <Badge variant="success">Owner</Badge>}
					</div>
				))}
			</SectionContent>
		</Section>
	);
}
