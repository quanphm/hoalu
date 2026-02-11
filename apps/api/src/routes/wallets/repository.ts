import { db, schema } from "#api/db/index.ts";
import { and, count, desc, eq, getTableColumns, sql } from "drizzle-orm";
import type * as z from "zod";

import type { UpdateWalletSchema } from "./schema";

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

	async findOne(param: { id: string; workspaceId: string }) {
		const [result] = await db
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

	async insert(param: NewWallet) {
		try {
			const [result] = await db.insert(schema.wallet).values(param).returning();
			return result;
		} catch (_error) {
			return null;
		}
	}

	async update<T extends z.infer<typeof UpdateWalletSchema>>(param: {
		id: string;
		workspaceId: string;
		payload: T;
	}) {
		try {
			const [result] = await db
				.update(schema.wallet)
				.set({
					updatedAt: sql`now()`,
					...param.payload,
				})
				.where(
					and(eq(schema.wallet.id, param.id), eq(schema.wallet.workspaceId, param.workspaceId)),
				)
				.returning();

			return result || null;
		} catch (_error) {
			return null;
		}
	}

	async delete(param: { id: string; workspaceId: string }) {
		await db
			.delete(schema.wallet)
			.where(and(eq(schema.wallet.id, param.id), eq(schema.wallet.workspaceId, param.workspaceId)))
			.returning();

		return { id: param.id };
	}
}
