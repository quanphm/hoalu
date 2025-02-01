import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { Stats } from "@/components/stats";
import { SendIcon, SquarePenIcon, WalletCardsIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Section>
				<SectionContent columns={4}>
					<Button variant="outline">
						<SendIcon className="mr-2 size-4" />
						Create expense
					</Button>
					<Button variant="outline">
						<WalletCardsIcon className="mr-2 size-4" />
						Create wallet
					</Button>
					<Button variant="outline">
						<SquarePenIcon className="mr-2 size-4" />
						Create task
					</Button>
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitle>Overview</SectionTitle>
				</SectionHeader>
				<SectionContent columns={12}>
					<Stats />
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitle>Recent entries</SectionTitle>
				</SectionHeader>
				<SectionContent columns={12}>
					<p>Hello</p>
				</SectionContent>
			</Section>
		</>
	);
}
