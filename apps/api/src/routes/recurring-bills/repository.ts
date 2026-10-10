import { projectBills } from "@hoalu/finance/billing";
import { monetary } from "@hoalu/finance/monetary";
import { and, eq, getTableColumns, isNotNull, sql } from "drizzle-orm";

import { db, schema } from "#api/db/index.ts";

import type { BillDefinition, Payment } from "@hoalu/finance/billing";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";

type TransactionLike = PgTransaction<
	NodePgQueryResultHKT,
	typeof schema,
	ExtractTablesWithRelations<typeof schema>
>;

type NewRecurringBill = typeof schema.recurringBill.$inferInsert;

const billColumns = getTableColumns(schema.recurringBill);

/**
 * A projected occurrence, joined back to the bill's display data.
 *
 * There is no `isPaid` field: an occurrence that has been paid for is not
 * projected at all. Paid status is resolved by period inside
 * `@hoalu/finance/billing`, never by matching a stored due date.
 */
interface ProjectedBillEntry {
	recurringBillId: string;
	/** `yyyy-MM-dd` rendering of the occurrence under the bill's current definition. */
	date: string;
	/** Stable occurrence identity, e.g. `"2026-09"`. */
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

interface UnifiedBillsProjection {
	overdue: ProjectedBillEntry[];
	today: ProjectedBillEntry[];
	upcoming: ProjectedBillEntry[];
	anomalies: { kind: string; recurringBillId: string; period: string; expenseIds: string[] }[];
	unsupported: string[];
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
	 * Load the (bills, payments) pair the projection needs, and project it.
	 *
	 * Bills come from `recurring_bill`; payments are the expenses linked to
	 * them through `expense.recurring_bill_id`. Nothing else is needed — in
	 * particular there is no stored occurrence table to keep in sync.
	 */
	async projection(param: { workspaceId: string; today: string }) {
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

		const billIds = bills.map((bill) => bill.id);
		const payments =
			billIds.length > 0
				? await db
						.select({
							expenseId: schema.expense.id,
							billId: schema.expense.recurringBillId,
							date: schema.expense.date,
						})
						.from(schema.expense)
						.where(
							and(
								eq(schema.expense.workspaceId, param.workspaceId),
								isNotNull(schema.expense.recurringBillId),
							),
						)
				: [];

		const definitions: BillDefinition[] = bills.map((bill) => ({
			id: bill.id,
			repeat: bill.repeat,
			anchorDate: bill.anchorDate,
			dueDay: bill.dueDay,
			dueMonth: bill.dueMonth,
			startsOn: bill.createdAt.slice(0, 10),
		}));

		const paymentRows: Payment[] = payments
			.filter((payment): payment is typeof payment & { billId: string } => payment.billId !== null)
			.map((payment) => ({
				billId: payment.billId,
				expenseId: payment.expenseId,
				// The expense date is a timestamptz; slice the stored date portion.
				// A positive-offset user's payment can land a day earlier here than it
				// does in the browser. Occurrence periods are month/week granular, so
				// this is only observable for a payment made within hours of a period
				// boundary.
				date: payment.date.slice(0, 10),
			}));

		const projection = projectBills({
			bills: definitions,
			payments: paymentRows,
			today: param.today,
		});

		const billsById = new Map(bills.map((bill) => [bill.id, bill]));
		const decorate = (occurrence: {
			billId: string;
			period: string;
			dueDate: string;
			daysUntil: number;
		}): ProjectedBillEntry | null => {
			const bill = billsById.get(occurrence.billId);
			if (!bill) return null;
			return {
				recurringBillId: bill.id,
				date: occurrence.dueDate,
				period: occurrence.period,
				daysUntil: occurrence.daysUntil,
				title: bill.title,
				amount: monetary.fromRealAmount(Number(bill.amount), bill.currency),
				currency: bill.currency,
				repeat: bill.repeat,
				walletId: bill.walletId,
				walletName: bill.walletName,
				categoryId: bill.categoryId ?? null,
				categoryName: bill.categoryName ?? null,
				categoryColor: bill.categoryColor ?? null,
			};
		};

		const translate = (occurrences: typeof projection.overdue) =>
			occurrences.map(decorate).filter((entry): entry is ProjectedBillEntry => entry !== null);

		return {
			overdue: translate(projection.overdue),
			today: translate(projection.today),
			upcoming: translate(projection.upcoming),
			anomalies: projection.anomalies.map((anomaly) => ({
				kind: anomaly.kind,
				recurringBillId: anomaly.billId,
				period: anomaly.period,
				expenseIds: anomaly.expenseIds,
			})),
			unsupported: projection.unsupported,
		} satisfies UnifiedBillsProjection;
	}

	/* ------------------------------------------------------------------ */
	/*  Transaction-aware methods — used by the expense route to keep     */
	/*  recurring-bill internals behind this repository's interface.      */
	/* ------------------------------------------------------------------ */

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
