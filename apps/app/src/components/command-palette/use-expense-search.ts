import { htmlToText } from "#app/helpers/dom-parser.ts";
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
					categoryColor: category?.color,
				}));
		},
		[slug],
	);

	// Build the normalized haystack for uFuzzy (memoized, only changes when data changes)
	const haystackRef = useRef<{ titles: string[]; descriptions: string[]; normalized: string[] }>({
		titles: [],
		descriptions: [],
		normalized: [],
	});

	const haystack = useMemo(() => {
		if (!expenses) {
			return { titles: [], descriptions: [], normalized: [] };
		}
		const titles = expenses.map((e) => e.title);
		const descriptions = expenses.map((e) => htmlToText(e.description));
		const normalized = [...titles, ...descriptions].map((t) => normalizeSearch(t));
		return { titles, descriptions, normalized };
	}, [expenses]);
	haystackRef.current = haystack;

	const filtered = useMemo(() => {
		const trimmed = search.trim();
		if (!trimmed || !expenses || expenses.length === 0) return [];

		const normalizedNeedle = normalizeSearch(trimmed);
		const { normalized } = haystack;
		const expenseCount = expenses.length;

		// Use the composite search() API with outOfOrder support
		const [idxs, info] = uf.search(normalized, normalizedNeedle, 1);

		if (!idxs || idxs.length === 0) return [];

		// Determine which haystack indices contain the needle as an exact substring.
		// filter() is too loose (regexp b.*i.*a matches "bai"), so we check directly.
		const exactIdxs = new Set<number>();
		for (let i = 0; i < normalized.length; i++) {
			if (normalized[i].includes(normalizedNeedle)) {
				exactIdxs.add(i);
			}
		}

		// Build a ranges lookup from info so we can attach highlights
		// regardless of iteration order
		const rangesById = new Map<number, number[]>();
		if (info) {
			for (let i = 0; i < info.idx.length; i++) {
				rangesById.set(info.idx[i], info.ranges[i]);
			}
		}

		// The haystack is [titles..., descriptions...] (length 2N).
		// Indices 0..N-1 are title matches, N..2N-1 are description matches.
		// Map each hit back to an expense index and collect ranges per field.
		// Track whether the expense has any exact (non-fuzzy) match for priority sorting.
		const matchMap = new Map<
			number,
			{
				titleRanges: number[] | null;
				descriptionRanges: number[] | null;
				hasExactMatch: boolean;
			}
		>();

		for (const haystackIdx of idxs) {
			const isDescription = haystackIdx >= expenseCount;
			const expenseIdx = isDescription ? haystackIdx - expenseCount : haystackIdx;
			const ranges = rangesById.get(haystackIdx) ?? null;
			const isExact = exactIdxs.has(haystackIdx);

			let entry = matchMap.get(expenseIdx);
			if (!entry) {
				entry = { titleRanges: null, descriptionRanges: null, hasExactMatch: false };
				matchMap.set(expenseIdx, entry);
			}

			if (isExact) entry.hasExactMatch = true;

			if (isDescription) {
				entry.descriptionRanges = ranges;
			} else {
				entry.titleRanges = ranges;
			}
		}

		// Sort: exact matches first (by date desc), then fuzzy-only matches (by date desc).
		// Since expenses are already date-desc ordered, lower index = newer date.
		const sortedExpenseIdxs = [...matchMap.keys()].sort((a, b) => {
			const aExact = matchMap.get(a)!.hasExactMatch;
			const bExact = matchMap.get(b)!.hasExactMatch;
			if (aExact !== bExact) return aExact ? -1 : 1;
			return a - b;
		});

		return sortedExpenseIdxs.map((expenseIdx): ExpenseSearchResult => {
			const expense = expenses[expenseIdx];
			const entry = matchMap.get(expenseIdx)!;
			return {
				...expense,
				titleRanges: entry.titleRanges,
				descriptionRanges: entry.descriptionRanges,
			};
		});
	}, [expenses, search, haystack]);

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
