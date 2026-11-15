import { formatDateNear } from "#app/helpers/format-date.ts";

/**
 * The calendar date an occurrence falls on.
 *
 * `Nov 3` when the bill is due this year, `Feb 26, 2027` when it is not — a bare
 * `Feb 26` next to a bill due in 118 days is the ambiguity the dashboard used to
 * ship.
 */
export function formatDueDate(date: string): string {
	return formatDateNear(date);
}

/**
 * The relative phrasing for a due date, from the projection's `daysUntil`.
 *
 * `0` → "today" · positive → "in 4 days" · negative → "1 day late"
 */
export function formatDueIn(daysUntil: number): string {
	if (daysUntil === 0) return "today";

	if (daysUntil < 0) {
		const late = Math.abs(daysUntil);
		return `${late} day${late === 1 ? "" : "s"} late`;
	}

	return `in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`;
}
