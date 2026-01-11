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
