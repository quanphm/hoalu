import { CategoriesTable } from "@/components/categories-table";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/section";
import { categoriesQueryOptions } from "@/services/query-options";
import { PlusIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/settings/library")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Categories</SectionTitle>
				<Button variant="outline" size="sm">
					<PlusIcon className="mr-2 size-4" />
					Create category
				</Button>
			</SectionHeader>
			<SectionContent columns={3}>
				<div className="col-span-2">
					<CategoriesTable data={categories} />
				</div>
			</SectionContent>
		</Section>
	);
}
