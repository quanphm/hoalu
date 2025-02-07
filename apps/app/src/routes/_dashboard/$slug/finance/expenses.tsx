import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/finance/expenses")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Expense entries</SectionTitle>
			</SectionHeader>
			<SectionContent>
				<div className="aspect-video rounded-xl bg-muted/50" />
			</SectionContent>
		</Section>
	);
}
