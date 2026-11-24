import { and, count, desc, eq, getTableColumns, sql } from "drizzle-orm";

import { db, schema } from "#api/db/index.ts";

import type { Transaction } from "#api/lib/xact-id.ts";
import type { UpdateWalletSchema } from "./schema";
import type * as z from "zod";

const schemaColumns = getTableColumns(schema.wallet);

type NewWallet = typeof schema.wallet.$inferInsert;

export class WalletRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		const queryData = await db
			.select({
				...schemaColumns,
				owner: schema.user,
				total: count(schema.expense.id),
			})
			.from(schema.wallet)
			.innerJoin(schema.user, eq(schema.wallet.ownerId, schema.user.id))
			.leftJoin(schema.expense, eq(schema.wallet.id, schema.expense.walletId))
			.where(eq(schema.wallet.workspaceId, param.workspaceId))
			.groupBy(schema.wallet.id, schema.user.id);

		return queryData;
	}

	async findOne(param: { id: string; workspaceId: string }, tx?: Transaction) {
		const [result] = await (tx ?? db)
			.select({
				...schemaColumns,
				owner: schema.user,
				total: count(schema.expense.id),
			})
			.from(schema.wallet)
			.innerJoin(schema.user, eq(schema.wallet.ownerId, schema.user.id))
			.leftJoin(schema.expense, eq(schema.wallet.id, schema.expense.walletId))
			.where(and(eq(schema.wallet.id, param.id), eq(schema.wallet.workspaceId, param.workspaceId)))
			.groupBy(schema.wallet.id, schema.user.id)
			.orderBy(desc(schema.wallet.createdAt))
			.limit(1);

		return result || null;
	}

	async insert(param: NewWallet, tx?: Transaction) {
		const [result] = await (tx ?? db)
			.insert(schema.wallet)
			.values(param)
			.onConflictDoNothing({ target: schema.wallet.id })
			.returning();

		return result ?? null;
	}

	async update<T extends z.infer<typeof UpdateWalletSchema>>(
		param: {
			id: string;
			workspaceId: string;
			payload: T;
		},
		tx?: Transaction,
	) {
		const [result] = await (tx ?? db)
			.update(schema.wallet)
			.set({
				updatedAt: sql`now()`,
				...param.payload,
			})
			.where(and(eq(schema.wallet.id, param.id), eq(schema.wallet.workspaceId, param.workspaceId)))
			.returning();

		return result ?? null;
	}

	async delete(param: { id: string; workspaceId: string }, tx?: Transaction) {
		await (tx ?? db)
			.delete(schema.wallet)
			.where(and(eq(schema.wallet.id, param.id), eq(schema.wallet.workspaceId, param.workspaceId)));

		return { id: param.id };
	}
}
