import { createFileRoute } from "@tanstack/react-router";

import { CategoriesTable } from "#app/components/categories-table.tsx";
import { CreateCategoryDialogTrigger } from "#app/components/category-actions.tsx";
import {
	Section,
	SectionContent,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { useLiveQueryCategory } from "#app/hooks/use-db.ts";

export const Route = createFileRoute("/_dashboard/$slug/categories")({
	component: RouteComponent,
});

function RouteComponent() {
	const categories = useLiveQueryCategory();

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
