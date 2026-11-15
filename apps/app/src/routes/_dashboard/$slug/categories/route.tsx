import { Button } from "@hoalu/ui/button";
import { Tabs, TabsList, TabsTab } from "@hoalu/ui/tabs";
import { useValue } from "@legendapp/state/react";
import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { useRef } from "react";

import { type CategoryTypeFilter, categoryTypeFilter$ } from "#app/atoms/categories.ts";
import { CategorySearch } from "#app/components/categories/category-actions.tsx";
import CategoryList from "#app/components/categories/category-list.tsx";
import { PageContent } from "#app/components/layouts/page-content.tsx";
import { Section, SectionContent, SectionItem } from "#app/components/layouts/section.tsx";
import {
	Toolbar,
	ToolbarActions,
	ToolbarGroup,
	ToolbarTitle,
} from "#app/components/layouts/toolbar.tsx";

export const Route = createFileRoute("/_dashboard/$slug/categories")({
	component: LayoutComponent,
});

function LayoutComponent() {
	const { slug } = Route.useParams();
	const matches = useMatches();
	const categoryMatch = matches.find(
		(m) => m.routeId === "/_dashboard/$slug/categories/$categoryId",
	);
	const categoryId = categoryMatch
		? (categoryMatch.params as Record<string, string>).categoryId
		: undefined;
	const creating = matches.some((m) => m.routeId === "/_dashboard/$slug/categories/new");

	const typeFilter = useValue(categoryTypeFilter$);
	const setTypeFilter = categoryTypeFilter$.set;
	const listScrollRef = useRef(0);

	return (
		<div className="flex h-full min-h-0 flex-col">
			<Toolbar>
				<ToolbarGroup>
					<ToolbarTitle>Categories</ToolbarTitle>
				</ToolbarGroup>
				<ToolbarActions>
					<Button
						size="sm"
						disabled={creating}
						render={<Link to="/$slug/categories/new" params={{ slug }} />}
					>
						Create category
					</Button>
				</ToolbarActions>
			</Toolbar>

			<PageContent className="min-h-0 flex-1">
				<Section className="gap-0 max-md:min-h-0 max-md:flex-1">
					{categoryId || creating ? (
						<Outlet />
					) : (
						<>
							<div className="flex w-full min-w-0 flex-col items-center justify-between gap-2 border-b px-4 py-2 md:flex-row md:gap-0">
								<div className="flex w-full min-w-0 flex-wrap items-center gap-2 md:w-auto">
									<div className="max-md:w-full max-md:[scrollbar-width:none] max-md:overflow-x-auto max-md:[&::-webkit-scrollbar]:hidden">
										<Tabs
											className="w-fit"
											value={typeFilter}
											onValueChange={(value) => setTypeFilter(value as CategoryTypeFilter)}
										>
											<TabsList aria-label="Filter categories by type">
												<TabsTab value="all" className="h-6!">
													All
												</TabsTab>
												<TabsTab value="expense" className="h-6!">
													Expenses
												</TabsTab>
												<TabsTab value="income" className="h-6!">
													Incomes
												</TabsTab>
											</TabsList>
										</Tabs>
									</div>
									<CategorySearch />
								</div>
							</div>

							<SectionContent
								columns={12}
								className="grid-cols-1 overflow-hidden max-md:min-h-0 max-md:flex-1 md:h-[calc(100dvh-(--spacing(24)))] md:gap-0"
							>
								<SectionItem desktopSpan="col-span-12" tabletSpan={1} mobileOrder={1}>
									<CategoryList typeFilter={typeFilter} scrollRef={listScrollRef} />
								</SectionItem>
							</SectionContent>
						</>
					)}
				</Section>
			</PageContent>
		</div>
	);
}
