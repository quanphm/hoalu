import { and, count, eq, getTableColumns, sql } from "drizzle-orm";

import { db, schema } from "#api/db/index.ts";

import type { Transaction } from "#api/lib/xact-id.ts";

const schemaColumns = getTableColumns(schema.category);

type NewCategory = typeof schema.category.$inferInsert;

export class CategoryRepository {
	async findAllByWorkspaceId(param: {
		workspaceId: string;
		type?: "expense" | "income" | undefined;
	}) {
		const whereClause = param.type
			? and(
					eq(schema.category.workspaceId, param.workspaceId),
					eq(schema.category.type, param.type),
				)
			: eq(schema.category.workspaceId, param.workspaceId);

		const queryData = await db
			.select({
				...schemaColumns,
				total: count(schema.expense.id),
			})
			.from(schema.category)
			.leftJoin(schema.expense, eq(schema.category.id, schema.expense.categoryId))
			.where(whereClause)
			.groupBy(schema.category.id);

		return queryData;
	}

	async findOne(param: { id: string; workspaceId: string }, tx?: Transaction) {
		const [result] = await (tx ?? db)
			.select({
				...schemaColumns,
				total: count(schema.expense.id),
			})
			.from(schema.category)
			.leftJoin(schema.expense, eq(schema.expense.categoryId, schema.category.id))
			.where(
				and(eq(schema.category.id, param.id), eq(schema.category.workspaceId, param.workspaceId)),
			)
			.groupBy(schema.category.id)
			.limit(1);

		return result || null;
	}

	async insert(param: NewCategory, tx?: Transaction) {
		const [result] = await (tx ?? db)
			.insert(schema.category)
			.values(param)
			.onConflictDoNothing({ target: schema.category.id })
			.returning();

		return result ?? null;
	}

	async update<T>(param: { id: string; workspaceId: string; payload: T }, tx?: Transaction) {
		const [result] = await (tx ?? db)
			.update(schema.category)
			.set({
				updatedAt: sql`now()`,
				...param.payload,
			})
			.where(
				and(eq(schema.category.id, param.id), eq(schema.category.workspaceId, param.workspaceId)),
			)
			.returning();

		return result ?? null;
	}

	async delete(param: { id: string; workspaceId: string }, tx?: Transaction) {
		await (tx ?? db)
			.delete(schema.category)
			.where(
				and(eq(schema.category.id, param.id), eq(schema.category.workspaceId, param.workspaceId)),
			);

		return { id: param.id };
	}
}
