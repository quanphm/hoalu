import { addMonths, isAfter, startOfDay, subMonths } from "date-fns";
import { useMemo } from "react";

import type { SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import { buildOccurrenceMap, type OccurrenceEntry } from "#app/lib/recurring.ts";

const PROJECTION_MONTHS = 1;

export interface CalendarData {
	/** All upcoming (future projected) occurrences sorted ascending by date */
	upcomingBills: OccurrenceEntry[];
}

/**
 * For recurring expenses, deduplicate by (title, walletId) — keeping only the
 * most recently dated recording per unique bill. This prevents historical
 * recordings of the same recurring bill (e.g. last 12 months of "Netflix")
 * from each generating their own future projection, which would cause N × M
 * duplicates in the upcoming bills list.
 *
 * One-time expenses are always kept as-is (they have no projections anyway).
 */
function deduplicateRecurring(expenses: SyncedExpense[]): SyncedExpense[] {
	const oneTime = expenses.filter((e) => e.repeat === "one-time" || e.repeat === "custom");

	const recurringMap = new Map<string, SyncedExpense>();
	for (const expense of expenses) {
		if (expense.repeat === "one-time" || expense.repeat === "custom") continue;

		const key = `${expense.title.trim().toLowerCase()}::${expense.wallet.id}`;
		const existing = recurringMap.get(key);

		// Keep the one with the latest date (expenses from useLiveQueryExpenses are
		// already sorted desc by date, so the first we encounter is the latest)
		if (!existing || expense.date > existing.date) {
			recurringMap.set(key, expense);
		}
	}

	return [...oneTime, ...recurringMap.values()];
}

/**
 * Derives upcoming bill projections from the live expense query.
 *
 * - Recurring expenses are projected up to `PROJECTION_MONTHS` months ahead,
 *   using only the most recent recording per (title, wallet) to avoid duplicates.
 * - Returns upcoming projected occurrences sorted ascending by date.
 */
export function useCalendar(expenses: SyncedExpense[]): CalendarData {
	return useMemo(() => {
		const today = startOfDay(new Date());
		const windowStart = new Date(today.getFullYear(), today.getMonth(), 1);
		const windowEnd = addMonths(today, PROJECTION_MONTHS);

		// Only use recordings from the last month as projection sources.
		// Older recordings are too stale — the bill may have been cancelled
		// or changed since then.
		const oneMonthAgo = subMonths(today, 1);
		const recentExpenses = expenses.filter((e) =>
			isAfter(new Date(e.date), oneMonthAgo),
		);

		const dedupedExpenses = deduplicateRecurring(recentExpenses);

		const occurrenceMap = buildOccurrenceMap(
			dedupedExpenses.map((e) => ({
				id: e.id,
				title: e.title,
				date: e.date,
				amount: e.amount,
				currency: e.currency,
				repeat: e.repeat,
				category: e.category
					? {
							id: e.category.id ?? null,
							name: e.category.name ?? null,
							color: e.category.color ?? null,
						}
					: null,
				wallet: {
					id: e.wallet.id,
					name: e.wallet.name,
				},
			})),
			windowStart,
			windowEnd,
		);

		const upcomingBills: OccurrenceEntry[] = [];
		for (const entries of occurrenceMap.values()) {
			for (const entry of entries) {
				if (entry.kind === "projected") {
					upcomingBills.push(entry);
				}
			}
		}
		upcomingBills.sort((a, b) => a.date.localeCompare(b.date));

		return { upcomingBills };
	}, [expenses]);
}
