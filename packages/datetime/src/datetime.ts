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
	getMonth: dateFns.getMonth,
	getYear: dateFns.getYear,
};

/**
 * Convert a YYYY-MM-DD date string to an ISO 8601 datetime string
 * with the local timezone offset preserved.
 *
 * Unlike `new Date(dateStr).toISOString()` which converts to UTC and can
 * shift the date by a day for users in positive UTC offsets, this preserves
 * the intended date in the ISO string.
 *
 * Use on the FRONTEND when creating dates for the API.
 *
 * @example
 * toLocalISOString("2026-05-01")  // UTC+7 → "2026-05-01T00:00:00.000+07:00"
 *                                // UTC-5 → "2026-05-01T00:00:00.000-05:00"
 */
export function toLocalISOString(dateStr: string): string {
	const offset = -new Date().getTimezoneOffset();
	const hours = Math.floor(Math.abs(offset) / 60);
	const minutes = Math.abs(offset) % 60;
	const sign = offset >= 0 ? "+" : "-";
	const tz = `${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
	return `${dateStr}T00:00:00.000${tz}`;
}

/**
 * Extract the YYYY-MM-DD date from an ISO 8601 string by reading the
 * date portion directly — NOT through `new Date()` which would convert
 * using the server's timezone.
 *
 * When the frontend sends a timezone-aware ISO string like
 * `"2026-05-01T00:00:00.000+07:00"`, the date portion preserves the
 * user's intended date. This extracts it without timezone interference.
 *
 * Use on the BACKEND when you need the date the user intended.
 */
export function extractDateFromISO(isoString: string): string {
	return isoString.slice(0, 10);
}

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
