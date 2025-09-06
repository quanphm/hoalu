import * as dateFns from "date-fns";

export const TIME_IN_MILLISECONDS = {
	DEFAULT: 1,
	SECOND: 1000,
	MINUTE: 60_000,
	HOUR: 3_600_000,
	DAY: 86_400_000,
	WEEK: 604_800_000,
	YEAR: 31_536_000_000,
} as const;

export const TIME_IN_SECONDS = {
	DEFAULT: 1,
	SECOND: 1,
	MINUTE: 60,
	HOUR: 3_600,
	DAY: 86_400,
	WEEK: 604_800,
	YEAR: 31_536_000,
} as const;

export const datetime = {
	format: dateFns.format,
	intlFormatDistance: dateFns.intlFormatDistance,
	parse: dateFns.parse,
	startOfDay: dateFns.startOfDay,
	endOfDay: dateFns.endOfDay,
};

/**
 *
 * Convert `1753030800000-1753376400000` to `{ from, to }` object
 */
export function toFromToDateObject(searchDate?: string) {
	if (!searchDate) {
		return undefined;
	}

	const [fromStr, toStr] = searchDate.split("-", 2);
	if (!fromStr || !toStr) {
		return undefined;
	}

	const fromMs = Number(fromStr);
	const toMs = Number(toStr);
	if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) {
		return undefined;
	}

	return {
		from: new Date(fromMs),
		to: new Date(toMs),
	};
}
