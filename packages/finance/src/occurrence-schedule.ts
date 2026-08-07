function formatDate(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

function parseLocalDate(s: string): Date {
	return new Date(`${s}T00:00:00`);
}

function addDays(date: Date, n: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + n);
	return d;
}

function addYears(date: Date, n: number): Date {
	const d = new Date(date);
	d.setFullYear(d.getFullYear() + n);
	return d;
}

export interface ScheduleDefinition {
	repeat: string;
	anchorDate: string;
	dueDay: number | null;
	dueMonth: number | null;
}

/**
 * Generate all occurrence dates within [start, end] (inclusive).
 *
 * - daily:   every day
 * - weekly:  every 7 days starting from the first occurrence on or after start
 * - monthly: due_day each month (1-31), clamped to month-end
 * - yearly:  due_month / due_day each year
 *
 * Returns "yyyy-MM-dd" strings sorted ascending.
 */
export function schedule(definition: ScheduleDefinition, start: string, end: string): string[] {
	const startDate = parseLocalDate(start);
	const endDate = parseLocalDate(end);
	const results: string[] = [];

	if (definition.repeat === "daily") {
		let cur = new Date(startDate);
		for (let i = 0; i < 400; i++) {
			const ds = formatDate(cur);
			if (ds > end) break;
			if (ds >= start) results.push(ds);
			cur = addDays(cur, 1);
		}
		return results;
	}

	if (definition.repeat === "weekly") {
		const dow = definition.dueDay ?? parseLocalDate(definition.anchorDate).getDay();
		const startDow = startDate.getDay();
		const daysForward = (dow - startDow + 7) % 7;
		let cur = addDays(startDate, daysForward);
		for (let i = 0; i < 100; i++) {
			const ds = formatDate(cur);
			if (ds > end) break;
			results.push(ds);
			cur = addDays(cur, 7);
		}
		return results;
	}

	if (definition.repeat === "monthly") {
		const dueDay = definition.dueDay ?? parseLocalDate(definition.anchorDate).getDate();
		let y = startDate.getFullYear();
		let m = startDate.getMonth();
		for (let i = 0; i < 100; i++) {
			const occ = new Date(y, m, dueDay);
			if (occ.getMonth() !== m) occ.setDate(0);
			const ds = formatDate(occ);
			if (ds > end) break;
			if (ds >= start) results.push(ds);
			m++;
			if (m > 11) {
				m = 0;
				y++;
			}
		}
		return results;
	}

	if (definition.repeat === "yearly") {
		const anchor = parseLocalDate(definition.anchorDate);
		const dueMonth = (definition.dueMonth ?? anchor.getMonth() + 1) - 1;
		const dueDay = definition.dueDay ?? anchor.getDate();
		const startYear = startDate.getFullYear();
		const endYear = endDate.getFullYear();
		for (let year = startYear; year <= endYear; year++) {
			const occ = new Date(year, dueMonth, dueDay);
			if (occ.getMonth() !== dueMonth) occ.setDate(0);
			const ds = formatDate(occ);
			if (ds >= start && ds <= end) results.push(ds);
		}
		return results;
	}

	return results;
}

/**
 * Resolve which occurrence a payment on `referenceDate` satisfies.
 *
 * - monthly: the due_day in the reference month (clamped to month-end)
 * - weekly:  the most recent weekday occurrence (backward from reference)
 * - yearly:  the anchor month/day in the reference year
 * - daily:   the reference date itself
 *
 * Returns a "yyyy-MM-dd" string.
 */
export function occurrenceDate(
	definition: ScheduleDefinition,
	referenceDate: string,
): string {
	const [year, month, day] = referenceDate.split("-").map(Number);

	if (definition.repeat === "monthly" && definition.dueDay) {
		const occ = new Date(year, month - 1, definition.dueDay);
		if (occ.getMonth() !== month - 1) occ.setDate(0);
		return formatDate(occ);
	}

	if (definition.repeat === "weekly" && definition.dueDay !== null) {
		const ref = new Date(year, month - 1, day);
		const refDow = ref.getDay();
		const targetDow = definition.dueDay;
		const daysSinceDue = (refDow - targetDow + 7) % 7;
		return formatDate(new Date(year, month - 1, day - daysSinceDue));
	}

	if (definition.repeat === "yearly") {
		const anchor = parseLocalDate(definition.anchorDate);
		const dueMonth = definition.dueMonth ?? anchor.getMonth() + 1;
		const dueDay = definition.dueDay ?? anchor.getDate();
		return `${year}-${String(dueMonth).padStart(2, "0")}-${String(dueDay).padStart(2, "0")}`;
	}

	return referenceDate;
}

/**
 * Compute how far ahead to project for a given repeat frequency.
 *
 * - yearly: 1 year from today
 * - everything else: 1 month from today
 */
export function windowEnd(today: string, repeat: string): string {
	if (repeat === "yearly") {
		return formatDate(addYears(parseLocalDate(today), 1));
	}
	return formatDate(addDays(parseLocalDate(today), 30));
}
