import { htmlToText } from "#app/helpers/dom-parser.ts";
import { useFuzzySearch } from "#app/hooks/use-fuzzy-search.ts";
import { categoryCollectionFactory, expenseCollectionFactory } from "#app/lib/collections/index.ts";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";

import type { ExpenseSearchResult } from "./types.ts";

const RECENT_EXPENSES_LIMIT = 5;

interface UseExpenseSearchResult {
	filtered: ExpenseSearchResult[];
	recent: ExpenseSearchResult[];
}

export function useExpenseSearch(slug: string | undefined, search: string): UseExpenseSearchResult {
	const expenseCollection = useMemo(() => (slug ? expenseCollectionFactory(slug) : null), [slug]);
	const categoryCollection = useMemo(() => (slug ? categoryCollectionFactory(slug) : null), [slug]);

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
					public_id: expense.public_id,
					title: expense.title,
					description: expense.description,
					amount: expense.amount,
					currency: expense.currency,
					date: expense.date,
					categoryName: category?.name,
					categoryColor: category?.color,
				}));
		},
		[slug],
	);

	const fuzzyResults = useFuzzySearch(expenses, search, {
		getTextFields: (e) => [e.title, htmlToText(e.description)],
		getNumericValue: (e) => Number(e.amount),
	});

	const filtered = useMemo(
		() =>
			fuzzyResults.map(({ item, fieldRanges }) => ({
				...item,
				titleRanges: fieldRanges[0] ?? null,
				descriptionRanges: fieldRanges[1] ?? null,
			})),
		[fuzzyResults],
	);

	const recent = useMemo(() => {
		if (!expenses) return [];
		return expenses.slice(0, RECENT_EXPENSES_LIMIT).map(
			(e): ExpenseSearchResult => ({
				...e,
				titleRanges: null,
				descriptionRanges: null,
			}),
		);
	}, [expenses]);

	return { filtered, recent };
}
