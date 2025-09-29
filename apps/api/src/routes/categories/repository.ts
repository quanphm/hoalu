import { and, count, desc, eq, getTableColumns, sql } from "drizzle-orm";

import { db, schema } from "../../db";

const schemaColumns = getTableColumns(schema.category);

type NewCategory = typeof schema.category.$inferInsert;

export class CategoryRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		const queryData = await db
			.select({
				...schemaColumns,
				total: count(schema.expense.id),
			})
			.from(schema.category)
			.leftJoin(schema.expense, eq(schema.category.id, schema.expense.categoryId))
			.where(eq(schema.category.workspaceId, param.workspaceId))
			.groupBy(schema.category.id)
			.orderBy((result) => {
				return [desc(result.total), desc(result.name)];
			});

		return queryData;
	}

	async findOne(param: { id: string; workspaceId: string }) {
		const queryData = await db
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

		if (!queryData[0]) return null;

		const result = queryData[0];

		return result;
	}

	async insert(param: NewCategory) {
		const [category] = await db.insert(schema.category).values(param).returning();
		const result = await this.findOne({ id: category.id, workspaceId: category.workspaceId });
		return result;
	}

	async update<T>(param: { id: string; workspaceId: string; payload: T }) {
		const [category] = await db
			.update(schema.category)
			.set({
				updatedAt: sql`now()`,
				...param.payload,
			})
			.where(eq(schema.category.id, param.id))
			.returning();

		if (!category) return null;

		const result = await this.findOne({ id: category.id, workspaceId: category.workspaceId });
		return result;
	}

	async delete(param: { id: string; workspaceId: string }) {
		const [category] = await db
			.delete(schema.category)
			.where(
				and(eq(schema.category.id, param.id), eq(schema.category.workspaceId, param.workspaceId)),
			)
			.returning();

		if (!category) return { id: param.id };

		return { id: category.id };
	}
}
