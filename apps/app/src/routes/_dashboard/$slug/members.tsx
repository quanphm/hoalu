import { InviteDialog } from "@/components/invite-dialog";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { extractLetterFromName } from "@/helpers/extract-letter-from-name";
import { authClient } from "@/lib/auth-client";
import { getActiveMemberOptions, getWorkspaceDetailsOptions } from "@/services/query-options";
import { MailPlusIcon } from "@hoalu/icons/lucide";
import { Avatar, AvatarFallback, AvatarImage } from "@hoalu/ui/avatar";
import { Button } from "@hoalu/ui/button";
import { toast } from "@hoalu/ui/sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
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
			<SectionContent>
				{workspace.members.map((member) => (
					<div key={member.user.publicId} className="flex items-center gap-2">
						<Avatar className="h-8 w-8">
							<AvatarImage src={member.user.image || ""} alt={member.user.name} />
							<AvatarFallback>{extractLetterFromName(member.user.name)}</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">{member.user.name}</span>
							<span className="truncate text-xs">{member.user.email}</span>
						</div>
					</div>
				))}
			</SectionContent>
		</Section>
	);
}
