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
 * Format a number as currency based on 3-character currency symbol.
 *
 * Accepts a numeric string as well as a number: Postgres `numeric` columns arrive
 * over Electric as strings (to preserve precision), and VND/JPY-style
 * zero-decimal currencies pass through `monetary.fromRealAmount` unchanged, so a
 * string amount is a normal thing to hand this function.
 *
 * @example
 * formatCurrency(1234.56, 'USD'); // Returns: "$1,234.56"
 * formatCurrency({ rent: 1000, food: 250 }, 'USD'); // Returns: { rent: "$1,000.00", food: "$250.00" }
 */
export function formatCurrency(
	data: number | string | Record<string, number>,
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

	if (typeof data === "string") {
		const parsed = Number(data);
		if (Number.isFinite(parsed)) {
			return formatter.format(parsed);
		}
	}

	if (typeof data === "number") {
		return formatter.format(data);
	}

	// A record of amounts, formatted key-by-key. Guarded so that an array, a
	// boolean, or any other non-record cannot silently become an object of
	// character-index keys and be rendered as a React child.
	if (typeof data === "object" && data !== null && !Array.isArray(data)) {
		const entries = Object.entries(data).map(([k, v]) => [k, formatter.format(Number(v))]);
		return Object.fromEntries(entries);
	}

	throw new TypeError(
		`formatCurrency expected a number, a numeric string, or a record of amounts, received ${JSON.stringify(data)}`,
	);
}
