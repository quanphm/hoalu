// Special cases for currencies that commonly use different decimal places
const specialCases: Record<
	string,
	{ minimumFractionDigits: number; maximumFractionDigits: number }
> = {
	VND: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
	JPY: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
	KRW: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
	IDR: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
	BHD: { minimumFractionDigits: 3, maximumFractionDigits: 3 },
	KWD: { minimumFractionDigits: 3, maximumFractionDigits: 3 },
	OMR: { minimumFractionDigits: 3, maximumFractionDigits: 3 },
};

/**
 * Format a number as currency based on 3-character currency symbol
 * @example
 * formatCurrency(1234.56, 'USD'); // Returns: "$1,234.56"
 */
export function formatCurrency(
	data: number | Record<string, number>,
	code: string,
	options?: Intl.NumberFormatOptions,
) {
	const locale = navigator.language || "en-US";
	let localOptions: Intl.NumberFormatOptions = {
		style: "currency",
		currency: code,
		...options,
	};

	if (code in specialCases) {
		localOptions = {
			...localOptions,
			...specialCases[code],
		};
	}

	const formatter = new Intl.NumberFormat(locale, localOptions);

	if (typeof data === "number") {
		return formatter.format(data);
	}

	const entries = Object.entries(data).map(([k, v]) => [k, formatter.format(v)]);
	return Object.fromEntries(entries);
}
