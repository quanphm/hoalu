/**
 * Bill status projection.
 *
 * An occurrence is identified by a **period** — a stable calendar key such as
 * `"2026-09"` for a monthly bill — never by its due date. The due date is a
 * *rendering* of the bill's current definition: it moves when the definition
 * changes (due day 5 → 10), while the period stays put. Payments are matched to
 * occurrences by period, so editing a bill never orphans a payment that was
 * already recorded.
 *
 * Pure module: no I/O, no clock, no framework imports. `today` is injected by
 * the caller so the API (request-scoped) and the client (browser-local) can each
 * supply the date they consider "today".
 */

import { schedule, windowEnd } from "./occurrence-schedule.ts";

export type Repeat = "one-time" | "daily" | "weekly" | "monthly" | "yearly" | "custom";

export type BillingBucket = "overdue" | "today" | "upcoming";

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_IN_MILLISECONDS = 86_400_000;
const DEFAULT_LOOKBACK_DAYS = 30;

/** Period key for a bill that happens exactly once and has no recurrence. */
const PERIOD_ONCE = "once";

/**
 * The minimum a bill must expose to be projected. The row's display data
 * (title, amount, wallet, category) is the adapter's business — it joins that
 * back on by `id`.
 */
export interface BillDefinition {
	id: string;
	repeat: Repeat;
	/** `yyyy-MM-dd`. Anchors the recurrence; also the sole occurrence of a one-time bill. */
	anchorDate: string;
	/** monthly: day-of-month (1-31) · weekly: day-of-week (0 = Sunday .. 6 = Saturday). */
	dueDay: number | null;
	/** yearly: month (1-12). */
	dueMonth: number | null;
	/** `yyyy-MM-dd` local date the bill exists from — the lower clamp for the overdue lookback. */
	startsOn: string;
}

/** A payment: an expense whose `recurring_bill_id` points at a bill. */
export interface Payment {
	billId: string;
	expenseId: string;
	/** `yyyy-MM-dd` local calendar date of the payment. */
	date: string;
	/**
	 * Escape hatch for a payment whose date does not land in the period it is
	 * meant to settle (paying October early, back-filling September). The
	 * default path never sets this — `date` alone decides.
	 */
	period?: string | null;
}

export interface Occurrence {
	billId: string;
	/** Stable identity, e.g. `"2026-09"`, `"2026"`, `"2026-W36"`, `"2026-09-05"`. */
	period: string;
	/** Projected due date under the bill's *current* definition. Display only, never identity. */
	dueDate: string;
	bucket: BillingBucket;
	/** Negative when overdue, `0` today. */
	daysUntil: number;
}

export interface BillingAnomaly {
	kind: "unscheduled-payment" | "duplicate-payment";
	billId: string;
	period: string;
	expenseIds: string[];
}

export interface BillingProjection {
	overdue: Occurrence[];
	today: Occurrence[];
	upcoming: Occurrence[];
	/** Payments that landed on no scheduled occurrence, or that double-paid one period. */
	anomalies: BillingAnomaly[];
	/** Bill ids this module cannot schedule (`repeat: "custom"` or malformed dates). */
	unsupported: string[];
}

export interface BillingOptions {
	/** How far back to look for unpaid occurrences. Default 30. */
	lookbackDays?: number;
	/** Override the per-repeat lookahead. Default: 1 year for yearly bills, 30 days otherwise. */
	horizonDays?: number;
}

/**
 * Project every outstanding occurrence for every bill into overdue / today /
 * upcoming. A payment settles its occurrence's period, so a settled occurrence
 * is not listed at all.
 *
 * Period matching is deliberately *not* clipped to the projection window: a
 * payment recorded on 2026-09-05 still settles the September period when the
 * bill is viewed from October and the window only reaches back to 2026-09-10.
 *
 * Total function: malformed bills are reported in `unsupported` and malformed
 * payments are ignored, but it never throws. Adapters feed it rows that arrived
 * over the network, so a throw would be a crash on both runtimes.
 */
export function projectBills(
	input: { bills: readonly BillDefinition[]; payments: readonly Payment[]; today: string },
	options: BillingOptions = {},
): BillingProjection {
	const { today } = input;
	const lookbackDays = options.lookbackDays ?? DEFAULT_LOOKBACK_DAYS;

	const paymentsByBill = new Map<string, Payment[]>();
	for (const payment of input.payments) {
		const existing = paymentsByBill.get(payment.billId);
		if (existing) {
			existing.push(payment);
		} else {
			paymentsByBill.set(payment.billId, [payment]);
		}
	}

	const overdue: Occurrence[] = [];
	const todayOccurrences: Occurrence[] = [];
	const upcoming: Occurrence[] = [];
	const anomalies: BillingAnomaly[] = [];
	const unsupported: string[] = [];
	const seenBillIds = new Set<string>();

	for (const bill of input.bills) {
		if (seenBillIds.has(bill.id)) continue;
		seenBillIds.add(bill.id);

		const window = resolveWindow(bill, today, lookbackDays, options.horizonDays);
		if (!window) {
			unsupported.push(bill.id);
			continue;
		}

		const scheduled = buildSchedule(bill, window.start, window.end);
		const scheduledPeriods = new Set(scheduled.map((entry) => entry.period));

		const billsPayments = paymentsByBill.get(bill.id) ?? [];
		const paidPeriods = new Map<string, string[]>();
		for (const payment of billsPayments) {
			const period = payment.period ?? periodOf(bill, payment.date);
			const existing = paidPeriods.get(period);
			if (existing) {
				existing.push(payment.expenseId);
			} else {
				paidPeriods.set(period, [payment.expenseId]);
			}
		}

		for (const [period, expenseIds] of paidPeriods) {
			if (!scheduledPeriods.has(period)) continue;
			if (expenseIds.length > 1) {
				anomalies.push({
					kind: "duplicate-payment",
					billId: bill.id,
					period,
					expenseIds,
				});
			}
		}

		// Only payments inside the window are candidates for "this landed on no
		// occurrence" — older ones belong to occurrences the caller did not ask for.
		for (const payment of billsPayments) {
			if (payment.date < window.start || payment.date > window.end) continue;
			const period = payment.period ?? periodOf(bill, payment.date);
			if (scheduledPeriods.has(period)) continue;
			anomalies.push({
				kind: "unscheduled-payment",
				billId: bill.id,
				period,
				expenseIds: [payment.expenseId],
			});
		}

		for (const entry of scheduled) {
			if (paidPeriods.has(entry.period)) continue;

			const bucket: BillingBucket =
				entry.dueDate < today ? "overdue" : entry.dueDate === today ? "today" : "upcoming";

			const occurrence: Occurrence = {
				billId: bill.id,
				period: entry.period,
				dueDate: entry.dueDate,
				bucket,
				daysUntil: daysBetween(today, entry.dueDate),
			};

			if (bucket === "overdue") {
				overdue.push(occurrence);
			} else if (bucket === "today") {
				todayOccurrences.push(occurrence);
			} else {
				upcoming.push(occurrence);
			}
		}
	}

	return {
		overdue: sortOccurrences(overdue),
		today: sortOccurrences(todayOccurrences),
		upcoming: sortOccurrences(upcoming),
		anomalies,
		unsupported,
	};
}

/**
 * The period a date belongs to for a given bill. Good for labelling a payment;
 * not an identity for the due date (the due date is `schedule()`'s output).
 */
function periodOf(bill: BillDefinition, date: string): string {
	switch (bill.repeat) {
		case "monthly":
			return date.slice(0, 7);
		case "yearly":
			return date.slice(0, 4);
		case "weekly":
			return isoWeekKey(date);
		case "one-time":
			return PERIOD_ONCE;
		case "daily":
		case "custom":
		default:
			return date;
	}
}

interface ScheduledOccurrence {
	period: string;
	dueDate: string;
}

function buildSchedule(bill: BillDefinition, start: string, end: string): ScheduledOccurrence[] {
	if (bill.repeat === "one-time") {
		if (bill.anchorDate < start || bill.anchorDate > end) return [];
		return [{ period: PERIOD_ONCE, dueDate: bill.anchorDate }];
	}

	const dates = schedule(
		{
			repeat: bill.repeat,
			anchorDate: bill.anchorDate,
			dueDay: bill.dueDay,
			dueMonth: bill.dueMonth,
		},
		start,
		end,
	);

	return dates.map((dueDate) => ({ period: periodOf(bill, dueDate), dueDate }));
}

function resolveWindow(
	bill: BillDefinition,
	today: string,
	lookbackDays: number,
	horizonDays: number | undefined,
): { start: string; end: string } | null {
	if (bill.repeat === "custom") return null;
	if (!parseDate(today) || !parseDate(bill.startsOn) || !parseDate(bill.anchorDate)) return null;

	const lookback = addDays(today, -lookbackDays);
	const start = lookback > bill.startsOn ? lookback : bill.startsOn;
	const end =
		horizonDays === undefined ? windowEnd(today, bill.repeat) : addDays(today, horizonDays);

	return { start, end };
}

function sortOccurrences(occurrences: Occurrence[]): Occurrence[] {
	return occurrences.sort(
		(a, b) =>
			a.dueDate.localeCompare(b.dueDate) ||
			a.billId.localeCompare(b.billId) ||
			a.period.localeCompare(b.period),
	);
}

function parseDate(value: string): Date | null {
	const match = DATE_PATTERN.exec(value);
	if (!match) return null;
	const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
	return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function addDays(value: string, days: number): string {
	const date = parseDate(value);
	if (!date) return value;
	date.setDate(date.getDate() + days);
	return formatDate(date);
}

function daysBetween(from: string, to: string): number {
	const start = parseDate(from);
	const end = parseDate(to);
	if (!start || !end) return 0;
	return Math.round((end.getTime() - start.getTime()) / DAY_IN_MILLISECONDS);
}

/**
 * ISO-8601 week key (`"2026-W36"`, Monday-based) — the week containing `date`,
 * with the ISO week-year, which may differ from the calendar year at the edges.
 */
function isoWeekKey(value: string): string {
	const date = parseDate(value);
	if (!date) return value;

	const thursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	thursday.setDate(thursday.getDate() - ((thursday.getDay() + 6) % 7) + 3);

	const firstThursday = new Date(thursday.getFullYear(), 0, 4);
	firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

	const week =
		1 + Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * DAY_IN_MILLISECONDS));

	return `${thursday.getFullYear()}-W${String(week).padStart(2, "0")}`;
}
