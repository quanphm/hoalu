import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { MailPlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/members")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Members</SectionTitle>
				<Button variant="outline" size="sm">
					<MailPlusIcon className="mr-2 size-4" />
					Invite
				</Button>
			</SectionHeader>
			<SectionContent>Content</SectionContent>
		</Section>
	);
}
