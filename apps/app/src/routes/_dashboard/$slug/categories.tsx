import { createFileRoute } from "@tanstack/react-router";

import { CategoriesTable } from "#app/components/categories/categories-table.tsx";
import { CreateCategoryDialogTrigger } from "#app/components/categories/category-actions.tsx";
import { useLiveQueryCategories } from "#app/components/categories/use-categories.ts";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";

export const Route = createFileRoute("/_dashboard/$slug/categories")({
	component: RouteComponent,
});

function RouteComponent() {
	const categories = useLiveQueryCategories();

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
