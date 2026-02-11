/**
 * Normalize a string for diacritic-insensitive search.
 * Decomposes characters into base + combining marks (NFD), then strips
 * the combining marks so that e.g. "ăn sáng" → "an sang".
 */
export function normalizeSearch(input: string | null) {
	if (!input) {
		return "";
	}
	return input.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}
