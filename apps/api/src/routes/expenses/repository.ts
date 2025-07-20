import { and, desc, eq, sql } from "drizzle-orm";

import { generateId } from "@hoalu/common/generate-id";
import { db, schema } from "../../db";

type NewExpense = typeof schema.expense.$inferInsert;

export class ExpenseRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		const queryData = await db
			.select()
			.from(schema.expense)
			.innerJoin(schema.user, eq(schema.expense.creatorId, schema.user.id))
			.innerJoin(schema.workspace, eq(schema.expense.workspaceId, schema.workspace.id))
			.innerJoin(schema.wallet, eq(schema.expense.walletId, schema.wallet.id))
			.leftJoin(schema.category, eq(schema.expense.categoryId, schema.category.id))
			.where(eq(schema.expense.workspaceId, param.workspaceId))
			.orderBy(desc(sql`date(${schema.expense.date})`));

		const result = queryData.map((data) => ({
			...data.expense,
			realAmount: data.expense.amount,
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
			.innerJoin(schema.workspace, eq(schema.expense.workspaceId, schema.workspace.id))
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
			realAmount: queryData[0].expense.amount,
			creator: queryData[0].user,
			wallet: queryData[0].wallet,
			category: queryData[0].category,
		};

		return result;
	}

	async insert(param: Omit<NewExpense, "id" | "amount"> & { amount: string }) {
		const [expense] = await db
			.insert(schema.expense)
			.values({
				id: generateId({ use: "uuid" }),
				...param,
			})
			.returning();

		const result = await this.findOne({ id: expense.id, workspaceId: expense.workspaceId });
		return result;
	}

	async update<T>(param: { id: string; workspaceId: string; payload: T }) {
		const [expense] = await db
			.update(schema.expense)
			.set({
				updatedAt: sql`now()`,
				...param.payload,
			})
			.where(eq(schema.expense.id, param.id))
			.returning();

		if (!expense) return null;

		const result = await this.findOne({ id: expense.id, workspaceId: expense.workspaceId });
		return result;
	}

	async delete(param: { id: string; workspaceId: string }) {
		const [expense] = await db
			.delete(schema.expense)
			.where(
				and(eq(schema.expense.id, param.id), eq(schema.expense.workspaceId, param.workspaceId)),
			)
			.returning();

		if (!expense) return null;

		return expense;
	}
}
