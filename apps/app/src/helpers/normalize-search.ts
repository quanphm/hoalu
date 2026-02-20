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

/**
 * Multi-term search function that supports:
 * - Diacritic-insensitive text matching (e.g., "com tam" matches "Cơm tấm")
 * - Numeric matching (e.g., "64" matches 640000)
 * - Multiple terms with AND logic (e.g., "kem 64" matches item with "kem" in title AND "64" in amount)
 *
 * @param query - Search query string (space-separated terms)
 * @param item - Item with text and numeric fields to search
 * @returns true if all terms match at least one field
 *
 * @example
 * ```ts
 * matchesSearch("kem 64", {
 *   textFields: [expense.title, expense.description],
 *   numericFields: [expense.amount],
 * })
 * ```
 */
export function matchesSearch(query: string, item: SearchableItem): boolean {
	if (!query.trim()) return true;

	const terms = query
		.trim()
		.split(/\s+/)
		.map((term) => ({
			text: normalizeSearch(term),
			numeric: term.replace(/[.,]/g, ""),
		}));

	// Pre-normalize text fields
	const normalizedTextFields = item.textFields.map((field) => normalizeSearch(field ?? null));

	// Pre-format numeric fields as strings
	const numericStrings = (item.numericFields ?? []).map((field) =>
		field != null ? String(field).replace(/[.,]/g, "") : "",
	);

	// All terms must match at least one field
	return terms.every(
		(term) =>
			normalizedTextFields.some((field) => field.includes(term.text)) ||
			numericStrings.some((field) => field.includes(term.numeric)),
	);
}
