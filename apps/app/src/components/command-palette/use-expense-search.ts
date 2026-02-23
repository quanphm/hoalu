import { normalizeSearch } from "#app/helpers/normalize-search.ts";
import { categoryCollectionFactory, expenseCollectionFactory } from "#app/lib/collections/index.ts";
import uFuzzy from "@leeoniya/ufuzzy";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useMemo, useRef } from "react";

import type { ExpenseSearchResult } from "./types.ts";

const RECENT_EXPENSES_LIMIT = 3;

interface UseExpenseSearchResult {
	filtered: ExpenseSearchResult[];
	recent: ExpenseSearchResult[];
}

/**
 * uFuzzy instance configured for general fuzzy matching.
 * We pre-normalize the haystack (Vietnamese diacritics, đ→d, lowercase)
 * so uFuzzy only needs to handle character-level fuzziness.
 */
const uf = new uFuzzy({
	intraMode: 1,
	intraIns: 1,
	intraSub: 1,
	intraTrn: 1,
	intraDel: 1,
});

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

	// Build the normalized haystack for uFuzzy (memoized, only changes when data changes)
	const haystackRef = useRef<{ titles: string[]; normalized: string[] }>({
		titles: [],
		normalized: [],
	});

	const haystack = useMemo(() => {
		if (!expenses) return { titles: [], normalized: [] };
		const titles = expenses.map((e) => e.title);
		const normalized = titles.map((t) => normalizeSearch(t));
		return { titles, normalized };
	}, [expenses]);
	haystackRef.current = haystack;

	const filtered = useMemo(() => {
		const trimmed = search.trim();
		if (!trimmed || !expenses || expenses.length === 0) return [];

		const normalizedNeedle = normalizeSearch(trimmed);
		const { normalized } = haystack;

		// Use the composite search() API with outOfOrder support
		const [idxs, info] = uf.search(normalized, normalizedNeedle, 1);

		if (!idxs || idxs.length === 0) return [];

		// Build a ranges lookup from info so we can attach highlights
		// regardless of iteration order
		const rangesById = new Map<number, number[]>();
		if (info) {
			for (let i = 0; i < info.idx.length; i++) {
				rangesById.set(info.idx[i], info.ranges[i]);
			}
		}

		// Sort matched indices by date desc (original expense array order)
		// since expenses are already ordered by date desc from the live query
		const sortedIdxs = [...idxs].sort((a, b) => a - b);

		return sortedIdxs.map((haystackIdx): ExpenseSearchResult => {
			const expense = expenses[haystackIdx];
			return {
				...expense,
				titleRanges: rangesById.get(haystackIdx) ?? null,
			};
		});
	}, [expenses, search, haystack]);

	const recent = useMemo(() => {
		if (!expenses) return [];
		return expenses.slice(0, RECENT_EXPENSES_LIMIT).map(
			(e): ExpenseSearchResult => ({
				...e,
				titleRanges: null,
			}),
		);
	}, [expenses]);

	return { filtered, recent };
}
