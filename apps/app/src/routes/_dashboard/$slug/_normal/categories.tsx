import { CreateCategoryDialogTrigger } from "#app/components/categories/category-actions.tsx";
import { CategoryTable } from "#app/components/categories/category-table.tsx";
import { useLiveQueryCategories } from "#app/components/categories/use-categories.ts";
import {
	Section,
	SectionAction,
	SectionContent,
	SectionDescription,
	SectionHeader,
	SectionTitle,
} from "#app/components/layouts/section.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/_normal/categories")({
	component: RouteComponent,
});

function RouteComponent() {
	const categories = useLiveQueryCategories();

	return (
		<Section>
			<SectionHeader>
				<SectionTitle>Categories</SectionTitle>
				<SectionDescription>
					Organize your expenses with custom categories and color codes
				</SectionDescription>
				<SectionAction>
					<CreateCategoryDialogTrigger />
				</SectionAction>
			</SectionHeader>
			<SectionContent columns={12}>
				<CategoryTable data={categories} />
			</SectionContent>
		</Section>
	)
}
