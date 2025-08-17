// Special cases for currencies that commonly use different decimal places
const specialCases: Record<
	string,
	{ minimumFractionDigits: number; maximumFractionDigits: number }
> = {
	JPY: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
	KRW: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
	IDR: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
	BHD: { minimumFractionDigits: 3, maximumFractionDigits: 3 },
	KWD: { minimumFractionDigits: 3, maximumFractionDigits: 3 },
	OMR: { minimumFractionDigits: 3, maximumFractionDigits: 3 },
};

/**
 * Format a number as currency based on 3-character currency symbol
 * @param {number} amount - The amount to format
 * @param {string} code - The 3-character ISO currency code (e.g., USD, EUR, GBP)
 * @returns {string} Formatted currency string
 *
 * @example
 * formatCurrency(1234.56, 'USD'); // Returns: "$1,234.56"
 */
export function formatCurrency(amount: number, code: string) {
	let options = {};
	const locale = navigator.language || "en-US";

	if (code in specialCases) {
		options = specialCases[code as keyof typeof specialCases];
	}

	const formatter = new Intl.NumberFormat(locale, {
		style: "currency",
		currency: code,
		...options,
	});
	return formatter.format(amount);
}
