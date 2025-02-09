import { ContentCard } from "@/components/cards";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/finance/wallets")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Wallets (4)</SectionTitle>
				<Button variant="outline" size="sm">
					<PlusIcon className="mr-2 size-4" />
					Add
				</Button>
			</SectionHeader>
			<SectionContent columns={4}>
				<ContentCard
					title="Cash wallet"
					content="Experience the power of AI in generating unique content."
				/>
				<ContentCard
					title="Mikun VCB"
					content="Experience the power of AI in generating unique content."
				/>
				<ContentCard title="Anna VCB" content="Let AI handle the proofreading of your documents." />
				<ContentCard title="VCB Visa" content="Let AI handle the proofreading of your documents." />
			</SectionContent>
		</Section>
	);
}
