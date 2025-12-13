import { count, eq, useLiveQuery } from "@tanstack/react-db";

import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { categoryCollectionFactory } from "#app/lib/collections/category.ts";
import { expenseCollectionFactory } from "#app/lib/collections/expense.ts";

export function useLiveQueryCategories() {
	const workspace = useWorkspace();
	const expenseCollection = expenseCollectionFactory(workspace.slug);
	const categoryCollection = categoryCollectionFactory(workspace.slug);

	const { data } = useLiveQuery(
		(q) => {
			return q
				.from({ category: categoryCollection })
				.leftJoin({ expense: expenseCollection }, ({ category, expense }) =>
					eq(category.id, expense.category_id),
				)
				.groupBy(({ category }) => [
					category.id,
					category.name,
					category.description,
					category.color,
				])
				.select(({ category }) => ({
					id: category.id,
					name: category.name,
					description: category.description,
					color: category.color,
					total: count(category.id),
				}));
		},
		[workspace.id],
	);

	return data;
}

type SyncedCategories = ReturnType<typeof useLiveQueryCategories>;
export type SyncedCategory = SyncedCategories[number];
