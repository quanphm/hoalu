import { datetime } from "@hoalu/datetime/datetime";

/** A `yyyy-MM-dd` string is a calendar date, not an instant — parse it locally. */
function toDate(value: Date | string): Date {
	if (value instanceof Date) return value;
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return datetime.parse(value, "yyyy-MM-dd", new Date());
	}
	return new Date(value);
}

/** `Oct 1, 2026` */
export function formatDate(value: Date | string): string {
	return datetime.format(toDate(value), "MMM d, yyyy");
}

/** `Oct 1` — for axis ticks and rows already inside a stated range. */
export function formatShortDate(value: Date | string): string {
	return datetime.format(toDate(value), "MMM d");
}

/** `Oct 1, 2026`, or `Oct 1` when the date falls in `reference`'s year. */
export function formatDateNear(value: Date | string, reference: Date = new Date()): string {
	const date = toDate(value);
	return date.getFullYear() === reference.getFullYear() ? formatShortDate(date) : formatDate(date);
}

/** `Oct 1, 2026 – Oct 31, 2026` (en dash, not a hyphen); a single day prints once. */
export function formatDateRange(from: Date | string, to: Date | string): string {
	const start = formatDate(from);
	const end = formatDate(to);
	return start === end ? start : `${start} – ${end}`;
}

/** `October 2026` */
export function formatMonthYear(value: Date | string): string {
	return datetime.format(toDate(value), "MMMM yyyy");
}

/** `Oct 2026` — a month bucket on an axis. */
export function formatMonthShort(value: Date | string): string {
	return datetime.format(toDate(value), "MMM yyyy");
}

/** `2026` */
export function formatYear(value: Date | string): string {
	return datetime.format(toDate(value), "yyyy");
}

/**
 * A chart's x-axis label, which follows the bucket the series was grouped by.
 * Both branches are `formatShortDate`-shaped: no leading zero, no year.
 */
export function formatAxisDate(value: string, bucket: "day" | "month"): string {
	const date = toDate(value);
	return bucket === "month" ? formatMonthShort(date) : formatShortDate(date);
}
