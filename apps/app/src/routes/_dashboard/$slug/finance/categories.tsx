import { CategoriesTable } from "@/components/categories-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { getWorkspaceDetailsOptions } from "@/services/query-options";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/finance/categories")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data: workspace } = useSuspenseQuery(getWorkspaceDetailsOptions(slug));
	const membersTableData = workspace.members.map((member) => ({
		id: member.user.id,
		name: member.user.name,
		email: member.user.email,
		image: member.user.image,
		role: member.role,
	}));

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Categories</SectionTitle>
				<Button variant="outline" size="sm">
					<PlusIcon className="mr-2 size-4" />
					Add
				</Button>
			</SectionHeader>
			<SectionContent>
				<CategoriesTable data={membersTableData} />
			</SectionContent>
		</Section>
	);
}
