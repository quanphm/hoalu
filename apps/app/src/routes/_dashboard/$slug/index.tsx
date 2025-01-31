import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { Stats } from "@/components/stats";
import { listWorkspacesOptions } from "@/lib/query-options";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());
	const params = useParams({ strict: false });
	const currentWorkspace = workspaces.find((ws) => ws.slug === params.slug);
	console.log(currentWorkspace);

	return (
		<>
			<Section>
				<SectionHeader>
					<SectionTitle>Overview</SectionTitle>
				</SectionHeader>
				<SectionContent className="grid-cols-12">
					<Stats />
				</SectionContent>
			</Section>

			<Section>
				<SectionHeader>
					<SectionTitle>Recent entries</SectionTitle>
				</SectionHeader>
				<SectionContent className="grid-cols-12">
					<p>Hello</p>
				</SectionContent>
			</Section>
		</>
	);
}
