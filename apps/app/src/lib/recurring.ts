import { addDays, addMonths, addWeeks, addYears, format, isAfter, isBefore, isEqual } from "date-fns";

import type { RepeatSchema } from "@hoalu/common/schema";

export interface OccurrenceEntry {
	/** The date this occurrence falls on, formatted as "yyyy-MM-dd" */
	date: string;
	/** Whether this is a real recorded expense or a projected future occurrence */
	kind: "recorded" | "projected";
	/** Original expense id */
	expenseId: string;
	/** The actual recorded expense date this projection was extrapolated from */
	sourceDate: string;
	title: string;
	amount: number;
	currency: string;
	repeat: RepeatSchema;
	categoryId?: string | null;
	categoryName?: string | null;
	categoryColor?: string | null;
	walletId: string;
	walletName: string;
}

interface ExpenseInput {
	id: string;
	title: string;
	date: string; // "yyyy-MM-dd"
	amount: number;
	currency: string;
	repeat: RepeatSchema;
	category?: {
		id?: string | null;
		name?: string | null;
		color?: string | null;
	} | null;
	wallet: {
		id: string;
		name: string;
	};
}

function toEntry(expense: ExpenseInput, date: Date, kind: OccurrenceEntry["kind"]): OccurrenceEntry {
	return {
		date: format(date, "yyyy-MM-dd"),
		kind,
		expenseId: expense.id,
		sourceDate: expense.date,
		title: expense.title,
		amount: expense.amount,
		currency: expense.currency,
		repeat: expense.repeat,
		categoryId: expense.category?.id ?? null,
		categoryName: expense.category?.name ?? null,
		categoryColor: expense.category?.color ?? null,
		walletId: expense.wallet.id,
		walletName: expense.wallet.name,
	};
}

function advance(date: Date, repeat: RepeatSchema, n: number): Date {
	switch (repeat) {
		case "daily":
			return addDays(date, n);
		case "weekly":
			return addWeeks(date, n);
		case "monthly":
			return addMonths(date, n);
		case "yearly":
			return addYears(date, n);
		default:
			return date;
	}
}

/**
 * Generate projected occurrences for a single expense within [windowStart, windowEnd].
 *
 * Strategy: find the next occurrence(s) after today by stepping forward from
 * the most recent recorded date (the expense.date passed in is already the
 * most recent recording, thanks to deduplication in use-calendar.ts).
 *
 * This means "predict next month's bill based on last month's actual date"
 * rather than projecting from the original creation date years ago.
 */
export function generateOccurrences(
	expense: ExpenseInput,
	windowStart: Date,
	windowEnd: Date,
): OccurrenceEntry[] {
	const results: OccurrenceEntry[] = [];

	if (expense.repeat === "one-time" || expense.repeat === "custom") {
		return results;
	}

	const lastRecordedDate = new Date(expense.date);
	const today = startOfDay(new Date());

	const inWindow = (d: Date) =>
		(isEqual(d, windowStart) || isAfter(d, windowStart)) &&
		(isEqual(d, windowEnd) || isBefore(d, windowEnd));

	// Step forward from the last recorded date until we find occurrences
	// that are both in the future (after today) and within the window.
	// Stop as soon as we've passed windowEnd.
	let step = 1;
	let current = advance(lastRecordedDate, expense.repeat, step);

	while (isBefore(current, windowEnd) || isEqual(current, windowEnd)) {
		if (isAfter(current, today) && inWindow(current)) {
			results.push(toEntry(expense, current, "projected"));
		}
		step++;
		current = advance(lastRecordedDate, expense.repeat, step);

		// Safety cap for daily repeats over a long window
		if (step > 400) break;
	}

	return results;
}

function startOfDay(date: Date): Date {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

/**
 * Build a map of "yyyy-MM-dd" → OccurrenceEntry[] for all expenses,
 * covering [windowStart, windowEnd].
 */
export function buildOccurrenceMap(
	expenses: ExpenseInput[],
	windowStart: Date,
	windowEnd: Date,
): Map<string, OccurrenceEntry[]> {
	const map = new Map<string, OccurrenceEntry[]>();

	for (const expense of expenses) {
		const occurrences = generateOccurrences(expense, windowStart, windowEnd);
		for (const occurrence of occurrences) {
			const existing = map.get(occurrence.date) ?? [];
			existing.push(occurrence);
			map.set(occurrence.date, existing);
		}
	}

	return map;
}
