/**
 * Home-page ledger model.
 *
 * The read pipeline behind the workspace home page: summaries in, rows out.
 * Pure — no I/O, no clock. `today` is injected so the relative labels are the
 * reader's calendar days rather than the server's, and so the ordering can be
 * reasoned about (and tested) without a browser.
 *
 * Two rules the rest of the app depends on:
 *
 * 1. **Currencies are never summed across each other.** `walletNets` arrives
 *    grouped per wallet per recorded currency; this module re-groups only by
 *    currency. A workspace holding ₫ and $ shows two lines rather than one
 *    invented total.
 * 2. **Nothing is called a balance.** Wallets carry no opening balance, so the
 *    figure is all-time in − out and is labelled as such.
 */

import { datetime } from "@hoalu/datetime/datetime";

import type { WorkspaceSummarySchema } from "#app/lib/schema.ts";

export type LedgerSort = "urgency" | "net" | "spend" | "recent" | "name";
export type LedgerSortDirection = "asc" | "desc";

export const LEDGER_SORTS = [
	{ value: "urgency", label: "Bills due", direction: "desc" },
	{ value: "net", label: "Net", direction: "desc" },
	{ value: "spend", label: "Spend", direction: "desc" },
	{ value: "recent", label: "Last touched", direction: "desc" },
	{ value: "name", label: "Name", direction: "asc" },
] as const satisfies ReadonlyArray<{
	value: LedgerSort;
	label: string;
	direction: LedgerSortDirection;
}>;

/** Each key has a sensible first direction; clicking the active one reverses it. */
export function defaultDirectionFor(sort: LedgerSort): LedgerSortDirection {
	return LEDGER_SORTS.find((option) => option.value === sort)?.direction ?? "desc";
}

/** All-time flow for one currency across every wallet that recorded it. */
export interface LedgerCurrencyLine {
	currency: string;
	inAmount: number;
	outAmount: number;
	netAmount: number;
	walletCount: number;
}

export interface LedgerRow {
	id: string;
	slug: string;
	name: string;
	logo: string | null;
	/** One line per currency in use, busiest first. */
	currencyLines: LedgerCurrencyLine[];
	primaryCurrency: string;
	activeWalletsCount: number;
	bills: WorkspaceSummarySchema["bills"];
	/** "5 Oct" — the next unpaid bill's due date, already narrowed for a dense cell. */
	nextDueLabel: string | null;
	spend: WorkspaceSummarySchema["spend"];
	/** "1–16 Sep" — the like-for-like window, or `null` when there is nothing to compare. */
	spendPreviousLabel: string | null;
	lastActivityAt: string | null;
	/** "10 Oct 2026", or "Never" when nothing has ever been recorded. */
	lastTouchedLabel: string;
	/** "6 days ago" — empty when there is no activity. */
	lastTouchedRelative: string;
	hasRecordedActivity: boolean;
	/** Higher means more owed. Used for the default order. */
	urgency: number;
}

/** `yyyy-MM-dd` in, "1–16 Sep" out. Never routed through `new Date()` string parsing. */
export function formatWindowRange(from: string, to: string): string {
	const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
	const [toYear, toMonth, toDay] = to.split("-").map(Number);
	if (!fromYear || !toYear) return `${from} – ${to}`;

	const monthName = (month: number) =>
		datetime.format(new Date(Date.UTC(fromYear, month - 1, 1)), "MMM");

	if (fromYear === toYear && fromMonth === toMonth) {
		return fromDay === toDay
			? `${fromDay} ${monthName(fromMonth)}`
			: `${fromDay}–${toDay} ${monthName(fromMonth)}`;
	}
	return `${fromDay} ${monthName(fromMonth)} – ${toDay} ${datetime.format(new Date(Date.UTC(toYear, toMonth - 1, 1)), "MMM")}`;
}

/**
 * Whole-calendar-day distance in the reader's own timezone.
 *
 * `Intl.RelativeTimeFormat` picks its own unit and answers "3 quarters ago",
 * which is not how anyone talks about their own money; days, months and years
 * are the only units this surface needs.
 */
export function formatDaysAgo(activityIso: string, today: string): string {
	const activity = new Date(activityIso);
	if (Number.isNaN(activity.getTime())) return "";

	const activityDay = Date.UTC(activity.getFullYear(), activity.getMonth(), activity.getDate());
	const [year, month, day] = today.split("-").map(Number);
	if (!year || !month || !day) return "";
	const todayDay = Date.UTC(year, month - 1, day);

	const days = Math.round((todayDay - activityDay) / 86_400_000);
	if (days <= 0) return "today";
	if (days === 1) return "yesterday";
	if (days < 30) return `${days} days ago`;

	const months = Math.round(days / 30.44);
	if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;

	const years = Math.round(days / 365.25);
	return years === 1 ? "1 year ago" : `${years} years ago`;
}

/** Group the per-wallet, per-currency flow into one line per currency. */
export function groupCurrencyLines(
	walletNets: WorkspaceSummarySchema["walletNets"],
): LedgerCurrencyLine[] {
	const byCurrency = new Map<string, LedgerCurrencyLine & { wallets: Set<string> }>();

	for (const wallet of walletNets) {
		const existing = byCurrency.get(wallet.currency) ?? {
			currency: wallet.currency,
			inAmount: 0,
			outAmount: 0,
			netAmount: 0,
			walletCount: 0,
			wallets: new Set<string>(),
		};
		existing.inAmount += wallet.inAmount;
		existing.outAmount += wallet.outAmount;
		existing.netAmount += wallet.netAmount;
		existing.wallets.add(wallet.walletId);
		byCurrency.set(wallet.currency, existing);
	}

	return [...byCurrency.values()]
		.map(({ wallets, ...line }) => ({ ...line, walletCount: wallets.size }))
		.sort(
			(a, b) =>
				Math.abs(b.inAmount) +
				Math.abs(b.outAmount) -
				(Math.abs(a.inAmount) + Math.abs(a.outAmount)),
		);
}

/** Unpaid occurrences, weighted so an overdue bill outranks anything upcoming. */
export function urgencyOf(bills: WorkspaceSummarySchema["bills"]): number {
	return bills.overdue * 1000 + bills.dueToday * 100 + bills.upcoming;
}

export function buildLedgerRow(summary: WorkspaceSummarySchema, today: string): LedgerRow {
	const currencyLines = groupCurrencyLines(summary.walletNets);
	const lastActivityAt = summary.lastActivityAt;
	const activityDate = lastActivityAt ? new Date(lastActivityAt) : null;
	const hasRecordedActivity = activityDate !== null;
	const isActivityValid = activityDate !== null && !Number.isNaN(activityDate.getTime());

	const previousWindow = summary.spend.previousWindow;
	const hasComparableSpend = summary.spend.previousAmount !== 0;

	return {
		id: summary.id,
		slug: summary.slug,
		name: summary.name,
		logo: summary.logo,
		currencyLines,
		primaryCurrency: summary.primaryCurrency,
		activeWalletsCount: summary.activeWalletsCount,
		bills: summary.bills,
		nextDueLabel: summary.bills.next
			? datetime.format(new Date(`${summary.bills.next.dueDate}T12:00:00`), "d MMM")
			: null,
		spend: summary.spend,
		spendPreviousLabel: hasComparableSpend
			? formatWindowRange(previousWindow.from, previousWindow.to)
			: null,
		lastActivityAt,
		lastTouchedLabel:
			isActivityValid && activityDate ? datetime.format(activityDate, "d MMM yyyy") : "Never",
		lastTouchedRelative:
			isActivityValid && activityDate ? formatDaysAgo(activityDate.toISOString(), today) : "",
		hasRecordedActivity,
		urgency: urgencyOf(summary.bills),
	};
}

export function buildLedgerRows(
	summaries: readonly WorkspaceSummarySchema[],
	today: string,
): LedgerRow[] {
	return summaries.map((summary) => buildLedgerRow(summary, today));
}

/**
 * Order the rows. `net` and `spend` read the workspace's own primary currency
 * for the tie-break; comparing unconverted currencies would be a fiction, so a
 * workspace without that currency simply sorts last within its group.
 */
export function sortLedgerRows(
	rows: readonly LedgerRow[],
	sort: LedgerSort,
	direction: LedgerSortDirection = defaultDirectionFor(sort),
): LedgerRow[] {
	const sorted = [...rows];
	const factor = direction === "asc" ? -1 : 1;
	const activityTime = (row: LedgerRow) =>
		row.lastActivityAt ? new Date(row.lastActivityAt).getTime() : 0;
	const primaryNet = (row: LedgerRow) =>
		row.currencyLines.find((line) => line.currency === row.primaryCurrency)?.netAmount ?? 0;

	switch (sort) {
		case "urgency":
			return sorted.sort(
				(a, b) => factor * (b.urgency - a.urgency || activityTime(b) - activityTime(a)),
			);
		case "net":
			return sorted.sort((a, b) => factor * (primaryNet(b) - primaryNet(a)));
		case "spend":
			return sorted.sort((a, b) => factor * (b.spend.currentAmount - a.spend.currentAmount));
		case "recent":
			return sorted.sort((a, b) => factor * (activityTime(b) - activityTime(a)));
		case "name":
			return sorted.sort((a, b) => factor * a.name.localeCompare(b.name));
	}
}

/** "Needs attention" means something is owed — dormant-but-settled is not a call to action. */
export function filterLedgerRows(
	rows: readonly LedgerRow[],
	needsAttentionOnly: boolean,
): LedgerRow[] {
	if (!needsAttentionOnly) return [...rows];
	return rows.filter((row) => row.urgency > 0);
}

/** Percentage change reads better as a direction than a signed number. */
export function formatSpendChange(changePercentage: number | null): string {
	if (changePercentage === null) return "—";
	if (Math.abs(changePercentage) < 0.5) return "No change";
	const sign = changePercentage > 0 ? "+" : "−";
	return `${sign}${Math.abs(Math.round(changePercentage))}%`;
}
