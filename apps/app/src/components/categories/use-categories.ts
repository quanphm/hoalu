import { useValue } from "@legendapp/state/react";
import { useLiveQuery } from "@tanstack/react-db";
import { useDeferredValue, useMemo } from "react";

import { categorySearchKeywords$, categoryTypeFilter$ } from "#app/atoms/categories.ts";
import { useFuzzyFilter } from "#app/hooks/use-fuzzy-search.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { categoryCollectionFactory } from "#app/lib/collections/index.ts";

export function useLiveQueryCategories() {
	const workspace = useWorkspace();
	const categoryCollection = categoryCollectionFactory(workspace.slug);

	const { data } = useLiveQuery(
		(q) => {
			return q.from({ category: categoryCollection }).select(({ category }) => ({
				id: category.id,
				name: category.name,
				description: category.description,
				color: category.color,
				type: category.type,
			}));
		},
		[workspace.slug],
	);

	return data;
}

type SyncedCategories = ReturnType<typeof useLiveQueryCategories>;
export type SyncedCategory = SyncedCategories[number];

const getCategoryTextFields = (category: SyncedCategory) => [category.name, category.description];

/**
 * Categories as shown by the categories page: type filter, then name order,
 * then fuzzy search. Both the list and the detail page read this so keyboard
 * navigation walks the same order the user sees.
 */
export function useFilteredCategories(): SyncedCategory[] {
	const categories = useLiveQueryCategories();
	const typeFilter = useValue(categoryTypeFilter$);
	const searchKeywords = useValue(categorySearchKeywords$);
	const deferredSearchKeywords = useDeferredValue(searchKeywords);

	const filtered = useMemo(
		() =>
			[...categories]
				.filter((category) => typeFilter === "all" || category.type === typeFilter)
				.sort((a, b) => a.name.localeCompare(b.name)),
		[categories, typeFilter],
	);

	return useFuzzyFilter(filtered, deferredSearchKeywords, {
		getTextFields: getCategoryTextFields,
	});
}
