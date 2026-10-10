import { datetime } from "@hoalu/datetime/datetime";

/** "Oct 15" — the calendar date an occurrence falls on. */
export function formatDueDate(date: string): string {
	return datetime.format(new Date(`${date}T00:00:00`), "MMM d");
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
