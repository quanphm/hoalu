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

export function niceMoneyAxis(
	values: number[],
	tickCount = 4,
): { domain: [number, number]; ticks: number[] } {
	const max = values.reduce((highest, value) => Math.max(highest, value), 0);
	const min = values.reduce((lowest, value) => Math.min(lowest, value), 0);
	const keepNegative = min < 0 && Math.abs(min) > max * 0.05;
	const low = keepNegative ? min : 0;

	const span = max - low || Math.abs(max) || 1;
	const rawStep = span / tickCount;
	const magnitude = 10 ** Math.floor(Math.log10(rawStep));
	const normalized = rawStep / magnitude;
	const step =
		(normalized <= 1
			? 1
			: normalized <= 2
				? 2
				: normalized <= 2.5
					? 2.5
					: normalized <= 5
						? 5
						: 10) * magnitude;

	const floor = Math.floor(low / step) * step;
	const ceiling = Math.ceil(max / step) * step;

	const ticks: number[] = [];
	for (let tick = floor; tick <= ceiling + step / 2; tick += step) {
		// Round off binary drift so an axis never prints 19.999999999.
		ticks.push(Number(tick.toFixed(6)));
	}

	return { domain: [floor, ceiling], ticks };
}
