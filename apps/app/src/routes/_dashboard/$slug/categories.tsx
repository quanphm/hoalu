import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CategoriesTable } from "#app/components/categories-table.tsx";
import { CreateCategoryDialogTrigger } from "#app/components/category-actions.tsx";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { categoriesQueryOptions } from "#app/services/query-options.ts";

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
