import { compareNumeric, normalizeSearch, parseQuery } from "#app/helpers/normalize-search.ts";
import uFuzzy from "@leeoniya/ufuzzy";
import { useMemo, useRef } from "react";

const uf = new uFuzzy({
	intraMode: 1,
	intraIns: 1,
	intraSub: 1,
	intraTrn: 1,
	intraDel: 1,
});

/**
 * Compute highlight ranges by finding each search term as a substring in the
 * normalized text. Fallback when uFuzzy doesn't provide ranges (e.g. multi-term
 * out-of-order queries).
 *
 * Since normalizeSearch preserves string length (1:1 character mapping), positions
 * found in normalized text map directly to the original text.
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

	const pairs: [number, number][] = [];
	for (let i = 0; i < ranges.length; i += 2) pairs.push([ranges[i], ranges[i + 1]]);
	pairs.sort((a, b) => a[0] - b[0]);

	const sorted: number[] = [];
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

interface FuzzySearchOptions<T> {
	/**
	 * Extract the text fields to search on. Each element becomes one
	 * independent haystack field; ranges are returned per field.
	 */
	getTextFields: (item: T) => (string | null | undefined)[];
	/**
	 * Optional: extract a numeric value for inline comparison expressions
	 * like "> 100000" or "<= 50,000" in the query string.
	 */
	getNumericValue?: (item: T) => number;
}

/**
 * Haystack layout: [field0_item0, field0_item1, ..., fieldK_item0, fieldK_item1, ...]
 * Given haystackIndex h and itemCount M:
 *   itemIdx  = h % M
 *   fieldIdx = Math.floor(h / M)
 */
function buildHaystack<T>(
	items: T[],
	getTextFields: (item: T) => (string | null | undefined)[],
): { normalized: string[]; fieldCount: number } {
	if (!items.length) return { normalized: [], fieldCount: 0 };
	const fieldCount = getTextFields(items[0]).length;
	const normalized: string[] = [];
	for (let f = 0; f < fieldCount; f++) {
		for (const item of items) {
			normalized.push(normalizeSearch(getTextFields(item)[f] ?? null));
		}
	}
	return { normalized, fieldCount };
}

/**
 * Fuzzy filter hook — returns only the matched subset of `items`, sorted by
 * exact matches first. Does not compute highlight ranges.
 *
 * Suitable for list filtering where highlights are not needed (e.g. transaction list).
 */
export function useFuzzyFilter<T>(
	items: T[] | undefined | null,
	query: string,
	options: FuzzySearchOptions<T>,
): T[] {
	// Use refs so the haystack memo only reruns when items change,
	// not when the callbacks change identity between renders.
	const getTextFieldsRef = useRef(options.getTextFields);
	getTextFieldsRef.current = options.getTextFields;
	const getNumericValueRef = useRef(options.getNumericValue);
	getNumericValueRef.current = options.getNumericValue;

	const haystack = useMemo(
		() => (items?.length ? buildHaystack(items, getTextFieldsRef.current) : { normalized: [], fieldCount: 0 }),
		[items],
	);

	return useMemo(() => {
		if (!items?.length) return [];
		const trimmed = query.trim();
		if (!trimmed) return items;

		const { terms: parsedTerms, comparisons } = parseQuery(trimmed);
		const textNeedle = parsedTerms.map((t) => t.text).join(" ");
		const hasTextSearch = textNeedle.length > 0;
		const hasComparisons = comparisons.length > 0;
		const getNumericValue = getNumericValueRef.current;

		const passesComparisons = (item: T) => {
			if (!hasComparisons || !getNumericValue) return true;
			const value = getNumericValue(item);
			return comparisons.every((comp) => compareNumeric(value, comp.op, comp.value));
		};

		if (!hasTextSearch) return items.filter(passesComparisons);

		const { normalized } = haystack;
		const itemCount = items.length;
		const normalizedNeedle = normalizeSearch(textNeedle);
		const normalizedTerms = normalizedNeedle.split(/\s+/).filter(Boolean);

		const [idxs] = uf.search(normalized, normalizedNeedle, 1);
		if (!idxs?.length) return [];

		const exactItemIdxs = new Set<number>();
		const matchedItemIdxs = new Set<number>();

		for (const h of idxs) {
			const itemIdx = h % itemCount;
			if (hasComparisons && !passesComparisons(items[itemIdx])) continue;
			matchedItemIdxs.add(itemIdx);
			if (normalizedTerms.every((term) => normalized[h].includes(term))) {
				exactItemIdxs.add(itemIdx);
			}
		}

		return [...matchedItemIdxs]
			.sort((a, b) => {
				const aExact = exactItemIdxs.has(a);
				const bExact = exactItemIdxs.has(b);
				if (aExact !== bExact) return aExact ? -1 : 1;
				return a - b;
			})
			.map((i) => items[i]);
	}, [items, query, haystack]);
}

export interface FuzzySearchResult<T> {
	item: T;
	/** Per-field highlight ranges matching the order of `getTextFields`. */
	fieldRanges: (number[] | null)[];
}

/**
 * Fuzzy search hook — returns matched items with per-field highlight ranges.
 *
 * Suitable for search UIs that need to highlight matched substrings
 * (e.g. command palette).
 */
export function useFuzzySearch<T>(
	items: T[] | undefined | null,
	query: string,
	options: FuzzySearchOptions<T>,
): FuzzySearchResult<T>[] {
	const getTextFieldsRef = useRef(options.getTextFields);
	getTextFieldsRef.current = options.getTextFields;
	const getNumericValueRef = useRef(options.getNumericValue);
	getNumericValueRef.current = options.getNumericValue;

	const haystack = useMemo(
		() => (items?.length ? buildHaystack(items, getTextFieldsRef.current) : { normalized: [], fieldCount: 0 }),
		[items],
	);

	return useMemo(() => {
		if (!items?.length) return [];
		const trimmed = query.trim();
		if (!trimmed) return [];

		const { terms: parsedTerms, comparisons } = parseQuery(trimmed);
		const textNeedle = parsedTerms.map((t) => t.text).join(" ");
		const hasTextSearch = textNeedle.length > 0;
		const hasComparisons = comparisons.length > 0;
		const getNumericValue = getNumericValueRef.current;
		const { normalized, fieldCount } = haystack;
		const itemCount = items.length;

		const passesComparisons = (item: T) => {
			if (!hasComparisons || !getNumericValue) return true;
			const value = getNumericValue(item);
			return comparisons.every((comp) => compareNumeric(value, comp.op, comp.value));
		};

		if (!hasTextSearch) {
			return items
				.filter(passesComparisons)
				.map((item) => ({ item, fieldRanges: Array<number[] | null>(fieldCount).fill(null) }));
		}

		const normalizedNeedle = normalizeSearch(textNeedle);
		const normalizedTerms = normalizedNeedle.split(/\s+/).filter(Boolean);

		const [idxs, info] = uf.search(normalized, normalizedNeedle, 1);
		if (!idxs?.length) return [];

		const exactHaystackIdxs = new Set<number>();
		for (const h of idxs) {
			if (normalizedTerms.every((term) => normalized[h].includes(term))) {
				exactHaystackIdxs.add(h);
			}
		}

		const rangesById = new Map<number, number[]>();
		if (info) {
			for (let i = 0; i < info.idx.length; i++) {
				rangesById.set(info.idx[i], info.ranges[i]);
			}
		}

		const matchMap = new Map<
			number,
			{ fieldRanges: (number[] | null)[]; hasExactMatch: boolean }
		>();

		for (const h of idxs) {
			const itemIdx = h % itemCount;
			const fieldIdx = Math.floor(h / itemCount);

			if (hasComparisons && !passesComparisons(items[itemIdx])) continue;

			const ranges = rangesById.get(h) ?? computeTermRanges(normalized[h], normalizedTerms);
			const isExact = exactHaystackIdxs.has(h);

			let entry = matchMap.get(itemIdx);
			if (!entry) {
				entry = {
					fieldRanges: Array<number[] | null>(fieldCount).fill(null),
					hasExactMatch: false,
				};
				matchMap.set(itemIdx, entry);
			}

			if (isExact) entry.hasExactMatch = true;
			entry.fieldRanges[fieldIdx] = ranges;
		}

		return [...matchMap.keys()]
			.sort((a, b) => {
				const aExact = matchMap.get(a)!.hasExactMatch;
				const bExact = matchMap.get(b)!.hasExactMatch;
				if (aExact !== bExact) return aExact ? -1 : 1;
				return a - b;
			})
			.map((itemIdx) => ({
				item: items[itemIdx],
				fieldRanges: matchMap.get(itemIdx)!.fieldRanges,
			}));
	}, [items, query, haystack]);
}
