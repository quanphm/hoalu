import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CategoriesTable } from "@/components/categories-table";
import { CreateCategoryDialogTrigger } from "@/components/category-actions";
import { Section, SectionContent, SectionHeader, SectionTitle } from "@/components/layouts/section";
import { categoriesQueryOptions } from "@/services/query-options";

export const Route = createFileRoute("/_dashboard/$slug/categories")({
	component: RouteComponent,
});

function RouteComponent() {
	const { slug } = Route.useParams();
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Categories</SectionTitle>
				<CreateCategoryDialogTrigger />
			</SectionHeader>
			<SectionContent columns={12}>
				<CategoriesTable data={categories} />
			</SectionContent>
		</Section>
	);
}
