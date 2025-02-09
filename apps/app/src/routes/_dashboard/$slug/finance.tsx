import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/finance")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<Section>
				<SectionHeader>
					<SectionTitle>Overview</SectionTitle>
				</SectionHeader>
				<SectionContent columns={3}>
					<div className="aspect-video rounded-xl bg-muted/50" />
					<div className="aspect-video rounded-xl bg-muted/50" />
					<div className="aspect-video rounded-xl bg-muted/50" />
				</SectionContent>
			</Section>
			<Outlet />
		</>
	);
}
