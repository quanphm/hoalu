import { monetary } from "@hoalu/finance/monetary";
import { occurrenceDate, schedule, windowEnd } from "@hoalu/finance/occurrence-schedule";
import type { ScheduleDefinition } from "@hoalu/finance/occurrence-schedule";
import { generateId } from "@hoalu/ids/generate-id";
import { and, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";

import { db, schema } from "#api/db/index.ts";

type TransactionLike = PgTransaction<
	NodePgQueryResultHKT,
	typeof schema,
	ExtractTablesWithRelations<typeof schema>
>;

type NewRecurringBill = typeof schema.recurringBill.$inferInsert;

const billColumns = getTableColumns(schema.recurringBill);

function billToDefinition(
	bill: Pick<typeof schema.recurringBill.$inferSelect, "repeat" | "anchorDate" | "dueDay" | "dueMonth">,
): ScheduleDefinition {
	return {
		repeat: bill.repeat,
		anchorDate: bill.anchorDate,
		dueDay: bill.dueDay,
		dueMonth: bill.dueMonth,
	};
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

		const todayStr = new Date().toISOString().slice(0, 10);

		const results: UpcomingBillEntry[] = [];

		for (const bill of rows) {
			const end = windowEnd(todayStr, bill.repeat);

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

			const dates = schedule(billToDefinition(bill), todayStr, end);
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
		const todayStr = new Date().toISOString().slice(0, 10);
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);

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
		const billIds = bills.map((b) => b.id);
		const paidOccurrences =
			billIds.length > 0
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
			const end = windowEnd(todayStr, bill.repeat);
			const billCreatedStr = bill.createdAt.slice(0, 10);
			const startStr = thirtyDaysAgoStr > billCreatedStr ? thirtyDaysAgoStr : billCreatedStr;

			const allDates = schedule(
				{
					repeat: bill.repeat,
					anchorDate: bill.anchorDate,
					dueDay: bill.dueDay,
					dueMonth: bill.dueMonth,
				},
				startStr,
				end,
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

	/* ------------------------------------------------------------------ */
	/*  Transaction-aware methods — used by the expense route to keep     */
	/*  recurring-bill internals behind this repository's interface.      */
	/* ------------------------------------------------------------------ */

	async findBillInTransaction(
		tx: TransactionLike,
		params: { billId: string; workspaceId: string },
	) {
		const [row] = await tx
			.select()
			.from(schema.recurringBill)
			.where(
				and(
					eq(schema.recurringBill.id, params.billId),
					eq(schema.recurringBill.workspaceId, params.workspaceId),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async advanceYearlyAnchor(tx: TransactionLike, params: { billId: string; anchorDate: string }) {
		await tx
			.update(schema.recurringBill)
			.set({ anchorDate: params.anchorDate, updatedAt: sql`now()` })
			.where(eq(schema.recurringBill.id, params.billId));
	}

	async markOccurrencePaid(
		tx: TransactionLike,
		params: {
			recurringBillId: string;
			expenseId: string;
			expenseDate: string;
		},
		bill: Pick<
			typeof schema.recurringBill.$inferSelect,
			"repeat" | "anchorDate" | "dueDay" | "dueMonth"
		>,
	) {
		const dueDateStr = occurrenceDate(billToDefinition(bill), params.expenseDate);

		const [existing] = await tx
			.select()
			.from(schema.recurringBillOccurrence)
			.where(
				and(
					eq(schema.recurringBillOccurrence.recurringBillId, params.recurringBillId),
					eq(schema.recurringBillOccurrence.dueDate, dueDateStr),
				),
			)
			.limit(1);

		if (existing) {
			await tx
				.update(schema.recurringBillOccurrence)
				.set({ expenseId: params.expenseId, paidAt: sql`now()`, updatedAt: sql`now()` })
				.where(eq(schema.recurringBillOccurrence.id, existing.id));
		} else {
			await tx.insert(schema.recurringBillOccurrence).values({
				id: generateId({ use: "uuid" }),
				recurringBillId: params.recurringBillId,
				dueDate: dueDateStr,
				expenseId: params.expenseId,
				paidAt: sql`now()`,
			});
		}
	}

	async clearOccurrenceForExpense(tx: TransactionLike, expenseId: string) {
		await tx
			.update(schema.recurringBillOccurrence)
			.set({ expenseId: null, paidAt: null, updatedAt: sql`now()` })
			.where(eq(schema.recurringBillOccurrence.expenseId, expenseId));
	}

	async syncBillFromExpense(
		tx: TransactionLike,
		params: {
			billId: string;
			changes: Record<string, unknown>;
		},
	) {
		await tx
			.update(schema.recurringBill)
			.set({ ...params.changes, updatedAt: sql`now()` })
			.where(eq(schema.recurringBill.id, params.billId));
	}

	async archiveOnTx(tx: TransactionLike, billId: string) {
		await tx
			.update(schema.recurringBill)
			.set({ isActive: false, updatedAt: sql`now()` })
			.where(eq(schema.recurringBill.id, billId));
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
