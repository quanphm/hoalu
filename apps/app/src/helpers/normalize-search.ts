/**
 * Normalize a string for diacritic-insensitive search.
 * Decomposes characters into base + combining marks (NFD), then strips
 * the combining marks so that e.g. "ăn sáng" → "an sang".
 *
 * Also handles Vietnamese đ/Đ (Latin D with stroke) which doesn't decompose
 * via NFD since it's a distinct Unicode character, not a base + combining mark.
 */
export function normalizeSearch(input: string | null) {
	if (!input) {
		return "";
	}
	return input
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase();
}

export type ComparisonOp = ">" | ">=" | "<" | "<=" | "=";

interface NumericComparison {
	op: ComparisonOp;
	value: number;
}

interface TextOrSubstringNumeric {
	text: string;
	numeric: string;
}

interface ParsedQuery {
	terms: TextOrSubstringNumeric[];
	comparisons: NumericComparison[];
}

/**
 * Pattern to match numeric comparison expressions.
 * Captures: operator (>=, <=, >, <, =) followed by optional space and a number
 * with optional thousand separators (commas or dots).
 * Examples: "> 100000", ">=120,000", "<= 1.000.000", "= 50000"
 */
const COMPARISON_REGEX = /([><=]=?)\s*([\d][[\d.,]*[\d]|[\d])/g;

/**
 * Parse a number string that may contain thousand separators (commas or dots).
 * Strips all separators and parses as integer.
 * Examples: "100,000" → 100000, "1.000.000" → 1000000
 */
function parseFormattedNumber(str: string): number {
	return Number(str.replace(/[.,]/g, ""));
}

export function compareNumeric(fieldValue: number, op: ComparisonOp, target: number): boolean {
	switch (op) {
		case ">":
			return fieldValue > target;
		case ">=":
			return fieldValue >= target;
		case "<":
			return fieldValue < target;
		case "<=":
			return fieldValue <= target;
		case "=":
			return fieldValue === target;
	}
}

/**
 * Parse a search query into text/numeric terms and comparison expressions.
 *
 * Comparison expressions like "> 100000", ">=120,000", "<= 50000" are extracted
 * first, then the remaining text is split into space-separated terms for
 * text/substring matching.
 */
export function parseQuery(query: string): ParsedQuery {
	const comparisons: NumericComparison[] = [];

	// Extract comparison expressions from the query
	const remaining = query.replace(COMPARISON_REGEX, (_, op: string, numStr: string) => {
		const value = parseFormattedNumber(numStr);
		if (!Number.isNaN(value)) {
			comparisons.push({ op: op as ComparisonOp, value });
		}
		return " "; // Replace matched expression with space
	});

	// Split remaining text into terms
	const terms = remaining
		.trim()
		.split(/\s+/)
		.filter((t) => t.length > 0)
		.map((term) => ({
			text: normalizeSearch(term),
			numeric: term.replace(/[.,]/g, ""),
		}));

	return { terms, comparisons };
}
