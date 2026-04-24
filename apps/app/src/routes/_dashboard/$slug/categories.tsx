import { categoryTypeFilterAtom } from "#app/atoms/categories.ts";
import { CreateCategoryDialogTrigger } from "#app/components/categories/category-actions.tsx";
import { CategoryTable } from "#app/components/categories/category-table.tsx";
import { useLiveQueryCategories } from "#app/components/categories/use-categories.ts";
import { PageContent } from "#app/components/layouts/page-content.tsx";
import { Section, SectionContent } from "#app/components/layouts/section.tsx";
import {
	Toolbar,
	ToolbarActions,
	ToolbarGroup,
	ToolbarTitle,
} from "#app/components/layouts/toolbar.tsx";
import { Tabs, TabsContent, TabsList, TabsTab } from "@hoalu/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { useAtom } from "jotai";

export const Route = createFileRoute("/_dashboard/$slug/categories")({
	component: RouteComponent,
});

function RouteComponent() {
	const categories = useLiveQueryCategories();
	const [typeFilter, setTypeFilter] = useAtom(categoryTypeFilterAtom);
	const filteredCategories = categories.filter((category) => category.type === typeFilter);

	return (
		<>
			<Toolbar>
				<ToolbarGroup>
					<ToolbarTitle>Categories</ToolbarTitle>
				</ToolbarGroup>
				<ToolbarActions>
					<CreateCategoryDialogTrigger />
				</ToolbarActions>
			</Toolbar>

			<PageContent>
				<Section>
					<Tabs
						value={typeFilter}
						onValueChange={(value) => setTypeFilter(value as "expense" | "income")}
						className="mb-4"
					>
						<TabsList>
							<TabsTab value="expense">Expense</TabsTab>
							<TabsTab value="income">Income</TabsTab>
						</TabsList>
						<TabsContent value={typeFilter}>
							<SectionContent columns={12}>
								<CategoryTable data={filteredCategories} />
							</SectionContent>
						</TabsContent>
					</Tabs>
				</Section>
			</PageContent>
		</>
	);
}
