import { db, schema } from "#api/db/index.ts";
import { monetary } from "@hoalu/common/monetary";
import { and, eq, getTableColumns, inArray, sql } from "drizzle-orm";

type NewRecurringBill = typeof schema.recurringBill.$inferInsert;

const billColumns = getTableColumns(schema.recurringBill);

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

/**
 * Generate all occurrence dates for a bill within [todayStr, windowEndStr].
 *
 * - daily:   every day from today
 * - weekly:  every week on due_day (0=Sun..6=Sat)
 * - monthly: every month on due_day (1-31); due_day is fixed — paying late never drifts the schedule
 * - yearly:  every year on due_month/due_day using anchor_date as the base
 */
function generateOccurrences(
	bill: {
		repeat: string;
		anchorDate: string;
		dueDay: number | null;
		dueMonth: number | null;
	},
	todayStr: string,
	windowEndStr: string,
): string[] {
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
		const dow = bill.dueDay ?? parseLocalDate(bill.anchorDate).getDay();
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
		const dueDay = bill.dueDay ?? parseLocalDate(bill.anchorDate).getDate();
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
		const anchor = parseLocalDate(bill.anchorDate);
		const dueMonth = (bill.dueMonth ?? anchor.getMonth() + 1) - 1;
		const dueDay = bill.dueDay ?? anchor.getDate();
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

	async update<T extends Record<string, unknown>>(param: {
		id: string;
		workspaceId: string;
		payload: T;
	}) {
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
	 * Look up a bill by id + workspaceId without any joins, so the result is
	 * never affected by missing wallet / category rows.
	 */
	async findRaw(param: { id: string; workspaceId: string }) {
		const [row] = await db
			.select()
			.from(schema.recurringBill)
			.where(
				and(
					eq(schema.recurringBill.id, param.id),
					eq(schema.recurringBill.workspaceId, param.workspaceId),
				),
			);
		return row ?? null;
	}

	/**
	 * Permanently delete a recurring bill. Returns the deleted row (id +
	 * creatorId) so the caller can perform auth checks atomically, or null if
	 * no matching row was found (wrong id / wrong workspace).
	 *
	 * The FK on expense.recurring_bill_id is defined with onDelete:"set null",
	 * so linked expenses are automatically unlinked by the DB.
	 */
	async permanentDelete(param: { id: string; workspaceId: string }) {
		const [deleted] = await db
			.delete(schema.recurringBill)
			.where(
				and(
					eq(schema.recurringBill.id, param.id),
					eq(schema.recurringBill.workspaceId, param.workspaceId),
				),
			)
			.returning({
				id: schema.recurringBill.id,
				creatorId: schema.recurringBill.creatorId,
			});
		return deleted ?? null;
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
		const oneMonthOutStr = formatDate(addDays(todayLocal, 30));
		const oneYearOutStr = formatDate(addYears(todayLocal, 1));

		const results: UpcomingBillEntry[] = [];

		for (const bill of rows) {
			const windowEndStr = bill.repeat === "yearly" ? oneYearOutStr : oneMonthOutStr;

			const entry = (dateStr: string): UpcomingBillEntry => ({
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

			const dates = generateOccurrences(bill, todayStr, windowEndStr);
			for (const ds of dates) {
				results.push(entry(ds));
			}
		}

		results.sort((a, b) => a.date.localeCompare(b.date));
		return results;
	}

	/**
	 * Find unified bills: overdue (unpaid past occurrences), today, and upcoming.
	 * Uses explicit occurrence tracking for paid status.
	 */
	async findUnified(param: { workspaceId: string }): Promise<{
		overdue: UnifiedBillEntry[];
		today: UnifiedBillEntry[];
		upcoming: UnifiedBillEntry[];
	}> {
		const todayStr = formatDate(new Date());
		const todayLocal = parseLocalDate(todayStr);
		const thirtyDaysAgoStr = formatDate(addDays(todayLocal, -30));
		const oneMonthOutStr = formatDate(addDays(todayLocal, 30));
		const oneYearOutStr = formatDate(addYears(todayLocal, 1));

		// Get all active recurring bills with their details
		const bills = await db
			.select({
				id: schema.recurringBill.id,
				title: schema.recurringBill.title,
				amount: schema.recurringBill.amount,
				currency: schema.recurringBill.currency,
				repeat: schema.recurringBill.repeat,
				anchorDate: schema.recurringBill.anchorDate,
				dueDay: schema.recurringBill.dueDay,
				dueMonth: schema.recurringBill.dueMonth,
				createdAt: schema.recurringBill.createdAt,
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

		// Get all paid occurrences for these bills
		const billIds = bills.map(b => b.id);
		const paidOccurrences = billIds.length > 0 
			? await db
				.select({
					recurringBillId: schema.recurringBillOccurrence.recurringBillId,
					dueDate: schema.recurringBillOccurrence.dueDate,
				})
				.from(schema.recurringBillOccurrence)
				.where(
					and(
						inArray(schema.recurringBillOccurrence.recurringBillId, billIds),
						sql`${schema.recurringBillOccurrence.expenseId} IS NOT NULL`,
					),
				)
			: [];

		const paidDatesByBill = new Map<string, Set<string>>();
		for (const po of paidOccurrences) {
			if (!paidDatesByBill.has(po.recurringBillId)) {
				paidDatesByBill.set(po.recurringBillId, new Set());
			}
			paidDatesByBill.get(po.recurringBillId)!.add(po.dueDate);
		}

		const overdue: UnifiedBillEntry[] = [];
		const today: UnifiedBillEntry[] = [];
		const upcoming: UnifiedBillEntry[] = [];

		for (const bill of bills) {
			// Generate all expected occurrences from bill start until window end
			const windowEndStr = bill.repeat === "yearly" ? oneYearOutStr : oneMonthOutStr;
			
			// For overdue detection, only look back 30 days (within the month)
			// AND don't show occurrences before the bill was created
			// This prevents showing overdue bills from before the bill existed
			const billCreatedStr = bill.createdAt.slice(0, 10);
			const startStr = thirtyDaysAgoStr > billCreatedStr ? thirtyDaysAgoStr : billCreatedStr;
			
			const allDates = generateOccurrencesRange(
				{ 
					repeat: bill.repeat, 
					anchorDate: bill.anchorDate, 
					dueDay: bill.dueDay, 
					dueMonth: bill.dueMonth 
				},
				startStr,
				windowEndStr,
			);

			const paidDates = paidDatesByBill.get(bill.id) ?? new Set();

			for (const dateStr of allDates) {
				if (paidDates.has(dateStr)) continue; // Skip paid occurrences

				const entry: UnifiedBillEntry = {
					recurringBillId: bill.id,
					date: dateStr,
					title: bill.title,
					amount: monetary.fromRealAmount(Number(bill.amount), bill.currency),
					currency: bill.currency,
					repeat: bill.repeat,
					walletId: bill.walletId,
					walletName: bill.walletName,
					categoryId: bill.categoryId ?? null,
					categoryName: bill.categoryName ?? null,
					categoryColor: bill.categoryColor ?? null,
					isPaid: false,
				};

				if (dateStr < todayStr) {
					overdue.push(entry);
				} else if (dateStr === todayStr) {
					today.push(entry);
				} else {
					upcoming.push(entry);
				}
			}
		}

		// Sort each category by date
		overdue.sort((a, b) => a.date.localeCompare(b.date));
		today.sort((a, b) => a.date.localeCompare(b.date));
		upcoming.sort((a, b) => a.date.localeCompare(b.date));

		return { overdue, today, upcoming };
	}
}

export interface UnifiedBillEntry {
	recurringBillId: string;
	date: string;
	title: string;
	amount: number;
	currency: string;
	repeat: string;
	walletId: string;
	walletName: string;
	categoryId: string | null;
	categoryName: string | null;
	categoryColor: string | null;
	isPaid: boolean;
}

/**
 * Generate occurrences within a date range [startStr, endStr].
 * Similar to generateOccurrences but doesn't filter by >= today.
 */
function generateOccurrencesRange(
	bill: {
		repeat: string;
		anchorDate: string;
		dueDay: number | null;
		dueMonth: number | null;
	},
	startStr: string,
	endStr: string,
): string[] {
	const start = parseLocalDate(startStr);
	const end = parseLocalDate(endStr);
	const results: string[] = [];

	if (bill.repeat === "daily") {
		let cur = new Date(start);
		while (true) {
			const ds = formatDate(cur);
			if (ds > endStr) break;
			if (ds >= startStr) results.push(ds);
			cur = addDays(cur, 1);
			if (results.length > 400) break;
		}
		return results;
	}

	if (bill.repeat === "weekly") {
		const dow = bill.dueDay ?? parseLocalDate(bill.anchorDate).getDay();
		// Find first occurrence >= start
		const startDow = start.getDay();
		let daysForward = ((dow - startDow) + 7) % 7;
		let cur = addDays(start, daysForward);
		while (true) {
			const ds = formatDate(cur);
			if (ds > endStr) break;
			results.push(ds);
			cur = addDays(cur, 7);
			if (results.length > 400) break;
		}
		return results;
	}

	if (bill.repeat === "monthly") {
		const dueDay = bill.dueDay ?? parseLocalDate(bill.anchorDate).getDate();
		let y = start.getFullYear();
		let m = start.getMonth();
		for (let i = 0; i < 400; i++) {
			const occ = new Date(y, m, dueDay);
			if (occ.getMonth() !== m) occ.setDate(0);
			const ds = formatDate(occ);
			if (ds > endStr) break;
			if (ds >= startStr) results.push(ds);
			m++;
			if (m > 11) { m = 0; y++; }
		}
		return results;
	}

	if (bill.repeat === "yearly") {
		const anchor = parseLocalDate(bill.anchorDate);
		const dueMonth = (bill.dueMonth ?? anchor.getMonth() + 1) - 1;
		const dueDay = bill.dueDay ?? anchor.getDate();
		const startYear = start.getFullYear();
		const endYear = end.getFullYear();
		for (let year = startYear; year <= endYear; year++) {
			const occ = new Date(year, dueMonth, dueDay);
			if (occ.getMonth() !== dueMonth) occ.setDate(0);
			const ds = formatDate(occ);
			if (ds >= startStr && ds <= endStr) results.push(ds);
		}
		return results;
	}

	return results;
}
