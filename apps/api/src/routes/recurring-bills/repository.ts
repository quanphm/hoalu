import { db, schema } from "#api/db/index.ts";
import { monetary } from "@hoalu/common/monetary";
import { and, eq, getTableColumns, sql } from "drizzle-orm";

type NewRecurringBill = typeof schema.recurringBill.$inferInsert;

const billColumns = getTableColumns(schema.recurringBill);

function addDays(date: Date, n: number): Date {
	const d = new Date(date);
	d.setDate(d.getDate() + n);
	return d;
}

function addWeeks(date: Date, n: number): Date {
	return addDays(date, n * 7);
}

function addMonths(date: Date, n: number): Date {
	const d = new Date(date);
	d.setMonth(d.getMonth() + n);
	return d;
}

function addYears(date: Date, n: number): Date {
	const d = new Date(date);
	d.setFullYear(d.getFullYear() + n);
	return d;
}

function advance(date: Date, repeat: string, n: number): Date {
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

function formatDate(d: Date): string {
	// Use local date parts to avoid UTC offset shifting the date
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

/** Parse a "yyyy-MM-dd" string as local midnight to avoid UTC-shift bugs. */
function parseLocalDate(s: string): Date {
	return new Date(`${s}T00:00:00`);
}

export interface UpcomingBillEntry {
	recurringBillId: string;
	date: string;
	title: string;
	amount: string;
	currency: string;
	repeat: string;
	walletId: string;
	walletName: string;
	categoryId: string | null;
	categoryName: string | null;
	categoryColor: string | null;
}

export class RecurringBillRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		const rows = await db
			.select({
				...billColumns,
				wallet: schema.wallet,
				category: schema.category,
			})
			.from(schema.recurringBill)
			.innerJoin(schema.wallet, eq(schema.recurringBill.walletId, schema.wallet.id))
			.leftJoin(schema.category, eq(schema.recurringBill.categoryId, schema.category.id))
			.where(
				and(
					eq(schema.recurringBill.workspaceId, param.workspaceId),
					eq(schema.recurringBill.isActive, true),
				),
			);

		return rows.map((r) => ({
			...r,
			wallet: r.wallet,
			category: r.category,
		}));
	}

	async findOne(param: { id: string; workspaceId: string }) {
		const [row] = await db
			.select({
				...billColumns,
				wallet: schema.wallet,
				category: schema.category,
			})
			.from(schema.recurringBill)
			.innerJoin(schema.wallet, eq(schema.recurringBill.walletId, schema.wallet.id))
			.leftJoin(schema.category, eq(schema.recurringBill.categoryId, schema.category.id))
			.where(
				and(
					eq(schema.recurringBill.id, param.id),
					eq(schema.recurringBill.workspaceId, param.workspaceId),
				),
			);
		return row ?? null;
	}

	async insert(param: NewRecurringBill) {
		try {
			const [result] = await db.insert(schema.recurringBill).values(param).returning();
			return result;
		} catch (_error) {
			return null;
		}
	}

	async update<T extends Record<string, unknown>>(param: { id: string; workspaceId: string; payload: T }) {
		const [result] = await db
			.update(schema.recurringBill)
			.set({ ...param.payload, updatedAt: sql`now()` })
			.where(
				and(
					eq(schema.recurringBill.id, param.id),
					eq(schema.recurringBill.workspaceId, param.workspaceId),
				),
			)
			.returning();
		return result ?? null;
	}

	async updateAnchorDate(param: { id: string; anchorDate: string }) {
		await db
			.update(schema.recurringBill)
			.set({ anchorDate: param.anchorDate, updatedAt: sql`now()` })
			.where(eq(schema.recurringBill.id, param.id));
	}

	async archive(param: { id: string; workspaceId: string }) {
		await db
			.update(schema.recurringBill)
			.set({ isActive: false, updatedAt: sql`now()` })
			.where(
				and(
					eq(schema.recurringBill.id, param.id),
					eq(schema.recurringBill.workspaceId, param.workspaceId),
				),
			);
		return { id: param.id };
	}

	async unarchive(param: { id: string; workspaceId: string }) {
		await db
			.update(schema.recurringBill)
			.set({ isActive: true, updatedAt: sql`now()` })
			.where(
				and(
					eq(schema.recurringBill.id, param.id),
					eq(schema.recurringBill.workspaceId, param.workspaceId),
				),
			);
		return { id: param.id };
	}

	/**
	 * Project upcoming occurrences for all active recurring bills in a workspace
	 * within [windowStart, windowEnd].
	 *
	 * For yearly bills: window spans 1 year from today.
	 * For all others: window spans 1 month from today.
	 * The windowEnd passed in should already encode both, and we filter per bill.
	 */
	async findUpcoming(param: { workspaceId: string }): Promise<UpcomingBillEntry[]> {
		const rows = await db
			.select({
				...billColumns,
				walletId: schema.wallet.id,
				walletName: schema.wallet.name,
				categoryId: schema.category.id,
				categoryName: schema.category.name,
				categoryColor: schema.category.color,
			})
			.from(schema.recurringBill)
			.innerJoin(schema.wallet, eq(schema.recurringBill.walletId, schema.wallet.id))
			.leftJoin(schema.category, eq(schema.recurringBill.categoryId, schema.category.id))
			.where(
				and(
					eq(schema.recurringBill.workspaceId, param.workspaceId),
					eq(schema.recurringBill.isActive, true),
				),
			);

		// Use local-date strings for all comparisons to avoid UTC offset bugs.
		// new Date() gives local time; formatDate() uses local date parts.
		const todayStr = formatDate(new Date());
		const todayLocal = parseLocalDate(todayStr);
		const oneMonthOutStr = formatDate(addMonths(todayLocal, 1));
		const oneYearOutStr = formatDate(addYears(todayLocal, 1));

		const results: UpcomingBillEntry[] = [];

		for (const bill of rows) {
			const windowEndStr = bill.repeat === "yearly" ? oneYearOutStr : oneMonthOutStr;
			// anchorDate is stored as "yyyy-MM-dd"; parse as local midnight
			const anchor = parseLocalDate(bill.anchorDate);

			let step = 1;
			let current = advance(anchor, bill.repeat, step);

			while (true) {
				const dateStr = formatDate(current);
				if (dateStr > windowEndStr) break;
				if (dateStr > todayStr) {
					results.push({
						recurringBillId: bill.id,
						date: dateStr,
						title: bill.title,
						amount: `${monetary.fromRealAmount(Number(bill.amount), bill.currency)}`,
						currency: bill.currency,
						repeat: bill.repeat,
						walletId: bill.walletId,
						walletName: bill.walletName,
						categoryId: bill.categoryId ?? null,
						categoryName: bill.categoryName ?? null,
						categoryColor: bill.categoryColor ?? null,
					});
				}
				step++;
				current = advance(anchor, bill.repeat, step);
				if (step > 400) break; // safety cap
			}
		}

		results.sort((a, b) => a.date.localeCompare(b.date));
		return results;
	}
}
