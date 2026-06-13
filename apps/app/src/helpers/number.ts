/**
 * Format a number with thousand separators
 * @param value - The number to format
 * @param options - Optional Intl.NumberFormatOptions
 * @returns Formatted number string with thousand separators
 * @example
 * formatNumber(1234567); // Returns: "1,234,567"
 * formatNumber(0); // Returns: "0"
 * formatNumber(1234.56, { maximumFractionDigits: 2 }); // Returns: "1,234.56"
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
	const formatter = new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 0,
		...options,
	});
	return formatter.format(value);
}

/**
 * Format a number in compact notation (e.g. 1.2K, 3.3M, 44M)
 * @param value - The number to format
 * @returns Compact formatted string
 * @example
 * formatCompactNumber(3300000); // Returns: "3.3M"
 * formatCompactNumber(44000000); // Returns: "44M"
 * formatCompactNumber(1234); // Returns: "1.2K"
 */
export function formatCompactNumber(value: number): string {
	const formatter = new Intl.NumberFormat("en-US", {
		notation: "compact",
		maximumFractionDigits: 1,
	});
	return formatter.format(value);
}
