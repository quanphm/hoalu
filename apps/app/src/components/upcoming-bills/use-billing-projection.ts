import { datetime } from "@hoalu/datetime/datetime";
import { projectBills } from "@hoalu/finance/billing";
import { monetary } from "@hoalu/finance/monetary";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";

import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
	categoryCollectionFactory,
	expenseCollectionFactory,
	recurringBillCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";

import type { BillDefinition, BillingAnomaly, Payment } from "@hoalu/finance/billing";

/**
 * A projected occurrence, joined to its bill's display data.
 *
 * `date` is the due date under the bill's current definition and may move when
 * the bill is edited; `period` is the occurrence's stable identity and is what
 * payments are matched against. An occurrence that has been paid for is not
 * projected at all.
 */
export interface ProjectedBill {
	recurringBillId: string;
	date: string;
	period: string;
	daysUntil: number;
	title: string;
	amount: number;
	currency: string;
	repeat: string;
	walletId: string;
	walletName: string;
	categoryId: string | null;
	categoryName: string | null;
	categoryColor: string | null;
}

export interface BillingProjection {
	overdue: ProjectedBill[];
	today: ProjectedBill[];
	upcoming: ProjectedBill[];
	/**
	 * The earliest unpaid occurrence per bill id — the answer to "what is next on
	 * this bill?". Bills with nothing outstanding in the window are absent.
	 */
	nextDueByBill: Record<string, ProjectedBill>;
	/** Payments that matched no occurrence, or double-paid one period. */
	anomalies: BillingAnomaly[];
	/** Bill ids the projection cannot schedule. */
	unsupported: string[];
}

/** The browser's local calendar date — the user's "today", unlike the server's UTC one. */
function localToday(): string {
	return datetime.format(new Date(), "yyyy-MM-dd");
}

/**
 * Project bills from data already synced into the browser.
 *
 * Runs off the same Electric collections the rest of the app reads, so the
 * dashboard agrees with the bills page, works offline, and needs no round trip.
 */
export function useBillingProjection(): BillingProjection {
	const workspace = useWorkspace();

	const { data: bills } = useLiveQuery(
		(q) =>
			q
				.from({ bill: recurringBillCollectionFactory(workspace.slug) })
				.innerJoin({ wallet: walletCollectionFactory(workspace.slug) }, ({ bill, wallet }) =>
					eq(bill.wallet_id, wallet.id),
				)
				.leftJoin({ category: categoryCollectionFactory(workspace.slug) }, ({ bill, category }) =>
					eq(bill.category_id, category.id),
				)
				.select(({ bill, wallet, category }) => ({
					...bill,
					wallet_name: wallet.name,
					category_name: category?.name ?? null,
					category_color: category?.color ?? null,
				})),
		[workspace.slug],
	);

	const { data: expenses } = useLiveQuery(
		(q) => q.from({ expense: expenseCollectionFactory(workspace.slug) }),
		[workspace.slug],
	);

	const today = localToday();

	return useMemo(() => {
		const activeBills = (bills ?? []).filter((bill) => bill.is_active);

		const definitions: BillDefinition[] = activeBills.map((bill) => ({
			id: bill.id,
			repeat: bill.repeat,
			anchorDate: bill.anchor_date,
			dueDay: bill.due_day,
			dueMonth: bill.due_month,
			// A date-only lower clamp; the stored timestamp's date part is enough.
			startsOn: bill.created_at.slice(0, 10),
		}));

		const payments: Payment[] = (expenses ?? [])
			.filter((expense) => expense.recurring_bill_id !== null)
			.map((expense) => ({
				billId: expense.recurring_bill_id as string,
				expenseId: expense.id,
				// The stored instant is UTC; render it in the user's timezone so a
				// payment made late in the day lands on the day the user meant.
				date: datetime.format(new Date(expense.date), "yyyy-MM-dd"),
			}));

		const projection = projectBills({ bills: definitions, payments, today });

		const billsById = new Map(activeBills.map((bill) => [bill.id, bill]));
		const decorate = (occurrence: {
			billId: string;
			period: string;
			dueDate: string;
			daysUntil: number;
		}): ProjectedBill | null => {
			const bill = billsById.get(occurrence.billId);
			if (!bill) return null;
			return {
				recurringBillId: bill.id,
				date: occurrence.dueDate,
				period: occurrence.period,
				daysUntil: occurrence.daysUntil,
				title: bill.title,
				// `amount` arrives from Electric as a numeric string; VND and other
				// zero-decimal currencies pass through `fromRealAmount` unchanged, so
				// coerce before handing it on as a number.
				amount: monetary.fromRealAmount(Number(bill.amount), bill.currency),
				currency: bill.currency,
				repeat: bill.repeat,
				walletId: bill.wallet_id,
				walletName: bill.wallet_name,
				categoryId: bill.category_id ?? null,
				categoryName: bill.category_name ?? null,
				categoryColor: bill.category_color ?? null,
			};
		};

		const translate = (occurrences: typeof projection.overdue) =>
			occurrences.map(decorate).filter((entry): entry is ProjectedBill => entry !== null);

		const overdue = translate(projection.overdue);
		const todayBills = translate(projection.today);
		const upcoming = translate(projection.upcoming);

		// Each bucket is sorted by due date and the buckets are chronological
		// relative to each other, so the first entry seen for a bill is that bill's
		// earliest unpaid occurrence — what the list page shows as "next due".
		const nextDueByBill: Record<string, ProjectedBill> = {};
		for (const bill of [...overdue, ...todayBills, ...upcoming]) {
			if (!nextDueByBill[bill.recurringBillId]) {
				nextDueByBill[bill.recurringBillId] = bill;
			}
		}

		return {
			overdue,
			today: todayBills,
			upcoming,
			nextDueByBill,
			anomalies: projection.anomalies,
			unsupported: projection.unsupported,
		};
	}, [bills, expenses, today]);
}
