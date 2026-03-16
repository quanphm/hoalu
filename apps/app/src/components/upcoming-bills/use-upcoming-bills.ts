import type { UpcomingBill } from "#app/components/upcoming-bills/upcoming-bills-list.tsx";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
	categoryCollectionFactory,
	recurringBillCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";
import { monetary } from "@hoalu/common/monetary";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useMemo } from "react";

function formatDate(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
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

function parseLocalDate(s: string): Date {
	return new Date(`${s}T00:00:00`);
}

interface BillShape {
	repeat: string;
	anchor_date: string;
	due_day: number | null;
	due_month: number | null;
}

function generateOccurrences(bill: BillShape, todayStr: string, windowEndStr: string): string[] {
	const today = parseLocalDate(todayStr);
	const upcoming: string[] = [];

	if (bill.repeat === "daily") {
		let cur = today;
		while (true) {
			const ds = formatDate(cur);
			if (ds > windowEndStr) break;
			upcoming.push(ds);
			cur = addDays(cur, 1);
			if (upcoming.length > 400) break;
		}
		return upcoming;
	}

	if (bill.repeat === "weekly") {
		const dow = bill.due_day ?? parseLocalDate(bill.anchor_date).getDay();
		const todayDow = today.getDay();
		const daysBack = (todayDow - dow + 7) % 7;
		const daysForward = daysBack === 0 ? 0 : 7 - daysBack;
		let cur = addDays(today, daysForward);
		while (true) {
			const ds = formatDate(cur);
			if (ds > windowEndStr) break;
			upcoming.push(ds);
			cur = addDays(cur, 7);
			if (upcoming.length > 400) break;
		}
		return upcoming;
	}

	if (bill.repeat === "monthly") {
		const dueDay = bill.due_day ?? parseLocalDate(bill.anchor_date).getDate();
		const startYear = today.getFullYear();
		const startMonth = today.getMonth();
		let m = startMonth;
		let y = startYear;
		for (let i = 0; i < 400; i++) {
			const occ = new Date(y, m, dueDay);
			if (occ.getMonth() !== m) occ.setDate(0);
			const ds = formatDate(occ);
			if (ds > windowEndStr) break;
			if (ds >= todayStr) upcoming.push(ds);
			m++;
			if (m > 11) {
				m = 0;
				y++;
			}
		}
		return upcoming;
	}

	if (bill.repeat === "yearly") {
		const anchor = parseLocalDate(bill.anchor_date);
		const dueMonth = (bill.due_month ?? anchor.getMonth() + 1) - 1;
		const dueDay = bill.due_day ?? anchor.getDate();
		for (let offset = 0; offset <= 2; offset++) {
			const occ = new Date(today.getFullYear() + offset, dueMonth, dueDay);
			if (occ.getMonth() !== dueMonth) occ.setDate(0);
			const ds = formatDate(occ);
			if (ds > windowEndStr) break;
			if (ds >= todayStr) upcoming.push(ds);
		}
		return upcoming;
	}

	return upcoming;
}

export function useUpcomingBills(): Omit<UpcomingBill, "isPaid">[] {
	const workspace = useWorkspace();
	const billCollection = recurringBillCollectionFactory(workspace.slug);
	const walletCollection = walletCollectionFactory(workspace.slug);
	const categoryCollection = categoryCollectionFactory(workspace.slug);

	const { data } = useLiveQuery(
		(q) =>
			q
				.from({ bill: billCollection })
				.innerJoin({ wallet: walletCollection }, ({ bill, wallet }) =>
					eq(bill.wallet_id, wallet.id),
				)
				.leftJoin({ category: categoryCollection }, ({ bill, category }) =>
					eq(bill.category_id, category.id),
				)
				.select(({ bill, wallet, category }) => ({
					id: bill.id,
					title: bill.title,
					amount: bill.amount,
					currency: bill.currency,
					repeat: bill.repeat,
					anchor_date: bill.anchor_date,
					due_day: bill.due_day,
					due_month: bill.due_month,
					is_active: bill.is_active,
					wallet_id: wallet.id,
					wallet_name: wallet.name,
					category_id: category?.id ?? null,
					category_name: category?.name ?? null,
					category_color: category?.color ?? null,
				})),
		[workspace.slug],
	);

	return useMemo(() => {
		if (!data) return [];

		const todayStr = formatDate(new Date());
		const todayLocal = parseLocalDate(todayStr);
		const oneMonthOutStr = formatDate(addDays(todayLocal, 30));
		const oneYearOutStr = formatDate(addYears(todayLocal, 1));

		const results: Omit<UpcomingBill, "isPaid">[] = [];

		for (const bill of data) {
			if (!bill.is_active) continue;

			const windowEndStr = bill.repeat === "yearly" ? oneYearOutStr : oneMonthOutStr;
			const dates = generateOccurrences(bill, todayStr, windowEndStr);

			for (const date of dates) {
				results.push({
					recurringBillId: bill.id,
					date,
					title: bill.title,
					amount: monetary.fromRealAmount(Number(bill.amount), bill.currency),
					currency: bill.currency,
					repeat: bill.repeat,
					walletId: bill.wallet_id,
					walletName: bill.wallet_name,
					categoryId: bill.category_id,
					categoryName: bill.category_name,
					categoryColor: bill.category_color,
				});
			}
		}

		results.sort((a, b) => a.date.localeCompare(b.date));

		return results;
	}, [data]);
}
