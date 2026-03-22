import { db, schema } from "#api/db/index.ts";
import { and, desc, eq, sql } from "drizzle-orm";

type NewIncome = typeof schema.income.$inferInsert;

export class IncomeRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		const queryData = await db
			.select()
			.from(schema.income)
			.innerJoin(schema.user, eq(schema.income.creatorId, schema.user.id))
			.innerJoin(schema.wallet, eq(schema.income.walletId, schema.wallet.id))
			.leftJoin(schema.category, eq(schema.income.categoryId, schema.category.id))
			.where(eq(schema.income.workspaceId, param.workspaceId))
			.orderBy(desc(schema.income.date), desc(schema.income.amount));

		const result = queryData.map((data) => ({
			...data.income,
			creator: data.user,
			wallet: data.wallet,
			category: data.category,
		}));

		return result;
	}

	async findOne(param: { id: string; workspaceId: string }) {
		const queryData = await db
			.select()
			.from(schema.income)
			.innerJoin(schema.user, eq(schema.income.creatorId, schema.user.id))
			.innerJoin(schema.wallet, eq(schema.income.walletId, schema.wallet.id))
			.leftJoin(schema.category, eq(schema.income.categoryId, schema.category.id))
			.where(and(eq(schema.income.id, param.id), eq(schema.income.workspaceId, param.workspaceId)));

		if (!queryData[0]) return null;

		const result = {
			...queryData[0].income,
			creator: queryData[0].user,
			wallet: queryData[0].wallet,
			category: queryData[0].category,
		};

		return result;
	}

	async insert(param: NewIncome) {
		try {
			const [result] = await db.insert(schema.income).values(param).returning();
			return result;
		} catch (_error) {
			return null;
		}
	}

	async update<T>(param: { id: string; workspaceId: string; payload: T }) {
		try {
			const [result] = await db
				.update(schema.income)
				.set({
					updatedAt: sql`now()`,
					...param.payload,
				})
				.where(
					and(eq(schema.income.id, param.id), eq(schema.income.workspaceId, param.workspaceId)),
				)
				.returning();

			return result || null;
		} catch (_error) {
			return null;
		}
	}

	async delete(param: { id: string; workspaceId: string }) {
		await db
			.delete(schema.income)
			.where(and(eq(schema.income.id, param.id), eq(schema.income.workspaceId, param.workspaceId)))
			.returning();

		return { id: param.id };
	}
}
