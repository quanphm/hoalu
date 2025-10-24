import { and, desc, eq, sql } from "drizzle-orm";

import { db, schema } from "#api/db/index.ts";

type NewExpense = typeof schema.expense.$inferInsert;

export class ExpenseRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		const queryData = await db
			.select()
			.from(schema.expense)
			.innerJoin(schema.user, eq(schema.expense.creatorId, schema.user.id))
			.innerJoin(schema.wallet, eq(schema.expense.walletId, schema.wallet.id))
			.leftJoin(schema.category, eq(schema.expense.categoryId, schema.category.id))
			.where(eq(schema.expense.workspaceId, param.workspaceId))
			.orderBy(desc(schema.expense.date), desc(schema.expense.amount));

		const result = queryData.map((data) => ({
			...data.expense,
			creator: data.user,
			wallet: data.wallet,
			category: data.category,
		}));

		return result;
	}

	async findOne(param: { id: string; workspaceId: string }) {
		const queryData = await db
			.select()
			.from(schema.expense)
			.innerJoin(schema.user, eq(schema.expense.creatorId, schema.user.id))
			.innerJoin(schema.wallet, eq(schema.expense.walletId, schema.wallet.id))
			.leftJoin(schema.category, eq(schema.expense.categoryId, schema.category.id))
			.where(
				and(eq(schema.expense.id, param.id), eq(schema.expense.workspaceId, param.workspaceId)),
			)
			.orderBy(desc(schema.expense.date))
			.limit(1);

		if (!queryData[0]) return null;

		const result = {
			...queryData[0].expense,
			creator: queryData[0].user,
			wallet: queryData[0].wallet,
			category: queryData[0].category,
		};

		return result;
	}

	async insert(param: NewExpense) {
		try {
			const [result] = await db.insert(schema.expense).values(param).returning();
			return result;
		} catch (_error) {
			return null;
		}
	}

	async update<T>(param: { id: string; workspaceId: string; payload: T }) {
		try {
			const [result] = await db
				.update(schema.expense)
				.set({
					updatedAt: sql`now()`,
					...param.payload,
				})
				.where(eq(schema.expense.id, param.id))
				.returning();

			return result || null;
		} catch (_error) {
			return null;
		}
	}

	async delete(param: { id: string; workspaceId: string }) {
		await db
			.delete(schema.expense)
			.where(
				and(eq(schema.expense.id, param.id), eq(schema.expense.workspaceId, param.workspaceId)),
			)
			.returning();

		return { id: param.id };
	}
}
