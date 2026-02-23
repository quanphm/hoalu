import { htmlToText } from "#app/helpers/dom-parser.ts";
import { compareNumeric, normalizeSearch, parseQuery } from "#app/helpers/normalize-search.ts";
import { categoryCollectionFactory, expenseCollectionFactory } from "#app/lib/collections/index.ts";
import uFuzzy from "@leeoniya/ufuzzy";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useMemo, useRef } from "react";

import type { ExpenseSearchResult } from "./types.ts";

const RECENT_EXPENSES_LIMIT = 3;

/**
 * Compute highlight ranges by finding each search term as a substring
 * in the normalized text. Used as a fallback when uFuzzy doesn't provide
 * ranges (e.g. multi-term out-of-order queries).
 *
 * Since normalizeSearch preserves string length (1:1 character mapping),
 * the positions found in normalized text map directly to the original text.
 *
 * Returns a flat array [start0, end0, start1, end1, ...] sorted by position.
 */
function computeTermRanges(normalizedText: string, normalizedTerms: string[]): number[] | null {
	const ranges: number[] = [];

	for (const term of normalizedTerms) {
		if (!term) continue;
		let pos = 0;
		while (true) {
			const idx = normalizedText.indexOf(term, pos);
			if (idx === -1) break;
			ranges.push(idx, idx + term.length);
			pos = idx + term.length;
		}
	}

	if (ranges.length === 0) return null;

	// Sort by start position and merge overlapping ranges
	const sorted: number[] = [];
	const pairs = [];
	for (let i = 0; i < ranges.length; i += 2) {
		pairs.push([ranges[i], ranges[i + 1]]);
	}
	pairs.sort((a, b) => a[0] - b[0]);

	let [curStart, curEnd] = pairs[0];
	for (let i = 1; i < pairs.length; i++) {
		if (pairs[i][0] <= curEnd) {
			curEnd = Math.max(curEnd, pairs[i][1]);
		} else {
			sorted.push(curStart, curEnd);
			[curStart, curEnd] = pairs[i];
		}
	}
	sorted.push(curStart, curEnd);

	return sorted;
}

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

		// Parse comparison expressions (e.g. "> 100000") from the search input.
		// Text terms are passed to uFuzzy; comparisons post-filter by amount.
		const { terms: parsedTerms, comparisons } = parseQuery(trimmed);
		const textNeedle = parsedTerms.map((t) => t.text).join(" ");
		const hasTextSearch = textNeedle.length > 0;
		const hasComparisons = comparisons.length > 0;

		// Helper: check if an expense passes all amount comparisons
		const passesComparisons = (amount: number) =>
			comparisons.every((comp) => compareNumeric(amount, comp.op, comp.value));

		const { normalized } = haystack;
		const expenseCount = expenses.length;

		// Comparison-only query (no text terms): filter all expenses by amount
		if (!hasTextSearch) {
			const results: ExpenseSearchResult[] = [];
			for (let i = 0; i < expenses.length; i++) {
				if (passesComparisons(Number(expenses[i].amount))) {
					results.push({
						...expenses[i],
						titleRanges: null,
						descriptionRanges: null,
					});
				}
			}
			return results;
		}

		const normalizedNeedle = normalizeSearch(textNeedle);
		const normalizedTerms = normalizedNeedle.split(/\s+/).filter(Boolean);

		// Use the composite search() API with outOfOrder support
		const [idxs, info] = uf.search(normalized, normalizedNeedle, 1);

		if (!idxs || idxs.length === 0) return [];

		// Determine which *matched* haystack indices contain every search term
		// as an exact substring. Only checks matched items (not the full haystack).
		const exactIdxs = new Set<number>();
		for (const i of idxs) {
			if (normalizedTerms.every((term) => normalized[i].includes(term))) {
				exactIdxs.add(i);
			}
		}

		// Build a ranges lookup from info so we can attach highlights.
		// For multi-term out-of-order queries, info may be null — fall back
		// to computing ranges by finding each term as a substring.
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

			// Post-filter by amount comparisons if present
			if (hasComparisons && !passesComparisons(Number(expenses[expenseIdx].amount))) {
				continue;
			}

			const ranges =
				rangesById.get(haystackIdx) ??
				computeTermRanges(normalized[haystackIdx], normalizedTerms);
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
