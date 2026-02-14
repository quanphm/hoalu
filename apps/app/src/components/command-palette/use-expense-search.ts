import { useMemo } from "react";
import { eq, useLiveQuery } from "@tanstack/react-db";

import { matchesSearch } from "#app/helpers/normalize-search.ts";
import { categoryCollectionFactory, expenseCollectionFactory } from "#app/lib/collections/index.ts";

import type { ExpenseSearchResult } from "./types.ts";

export function useExpenseSearch(slug: string | undefined, search: string): ExpenseSearchResult[] {
	const expenseCollection = useMemo(() => (slug ? expenseCollectionFactory(slug) : null), [slug]);
	const categoryCollection = useMemo(
		() => (slug ? categoryCollectionFactory(slug) : null),
		[slug],
	);

	const { data: expenses } = useLiveQuery(
		(q) => {
			if (!expenseCollection || !categoryCollection) return null;
			return q
				.from({ expense: expenseCollection })
				.leftJoin({ category: categoryCollection }, ({ expense, category }) =>
					eq(expense.category_id, category.id),
				)
				.orderBy(({ expense }) => expense.date, "desc")
				.select(({ expense, category }) => ({
					id: expense.id,
					title: expense.title,
					description: expense.description,
					amount: expense.amount,
					currency: expense.currency,
					date: expense.date,
					categoryName: category?.name,
				}));
		},
		[slug],
	);

	const filteredExpenses = useMemo(() => {
		if (!search.trim() || !expenses) return [];

		return expenses.filter((e) =>
			matchesSearch(search, {
				textFields: [e.title, e.description],
				numericFields: [e.amount],
			}),
		);
	}, [expenses, search]);

	return filteredExpenses;
}
