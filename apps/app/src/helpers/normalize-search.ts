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

interface SearchableItem {
	/** Text fields to search (title, description, etc.) */
	textFields: (string | null | undefined)[];
	/** Numeric fields to search (amount, etc.) */
	numericFields?: (number | null | undefined)[];
}

type ComparisonOp = ">" | ">=" | "<" | "<=" | "=";

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

function compareNumeric(fieldValue: number, op: ComparisonOp, target: number): boolean {
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
function parseQuery(query: string): ParsedQuery {
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

/**
 * Multi-term search function that supports:
 * - Diacritic-insensitive text matching (e.g., "com tam" matches "Cơm tấm")
 * - Numeric substring matching (e.g., "64" matches 640000)
 * - Numeric comparisons (e.g., "> 100000", ">=120,000", "<= 50000", "= 85000")
 * - Multiple terms with AND logic (e.g., "kem > 100000" matches items with "kem" in text AND amount > 100000)
 *
 * @param query - Search query string (space-separated terms, may include comparison operators)
 * @param item - Item with text and numeric fields to search
 * @returns true if all terms and comparisons match
 *
 * @example
 * ```ts
 * // Text + substring numeric search
 * matchesSearch("kem 64", {
 *   textFields: [expense.title, expense.description],
 *   numericFields: [expense.amount],
 * })
 *
 * // Comparison search
 * matchesSearch("> 100000", {
 *   textFields: [expense.title],
 *   numericFields: [expense.amount],
 * })
 *
 * // Combined text + comparison
 * matchesSearch("coffee >= 50,000", {
 *   textFields: [expense.title],
 *   numericFields: [expense.amount],
 * })
 * ```
 */
export function matchesSearch(query: string, item: SearchableItem): boolean {
	if (!query.trim()) return true;

	const { terms, comparisons } = parseQuery(query);

	// Pre-normalize text fields
	const normalizedTextFields = item.textFields.map((field) => normalizeSearch(field ?? null));

	// Pre-format numeric fields as strings (for substring matching)
	const numericStrings = (item.numericFields ?? []).map((field) =>
		field != null ? String(field).replace(/[.,]/g, "") : "",
	);

	// Raw numeric values (for comparison matching)
	const numericValues = (item.numericFields ?? []).filter(
		(field): field is number => field != null,
	);

	// All text/substring terms must match at least one field
	const termsMatch =
		terms.length === 0 ||
		terms.every(
			(term) =>
				normalizedTextFields.some((field) => field.includes(term.text)) ||
				numericStrings.some((field) => field.includes(term.numeric)),
		);

	// All comparison expressions must match at least one numeric field
	const comparisonsMatch =
		comparisons.length === 0 ||
		comparisons.every((comp) =>
			numericValues.some((value) => compareNumeric(value, comp.op, comp.value)),
		);

	return termsMatch && comparisonsMatch;
}
