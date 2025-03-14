import { generateId } from "@hoalu/common/generate-id";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "../../db";

type NewCategory = typeof schema.category.$inferInsert;

export class CategoryRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		const queryData = await db
			.select()
			.from(schema.category)
			.innerJoin(schema.workspace, eq(schema.category.workspaceId, schema.workspace.id))
			.where(eq(schema.category.workspaceId, param.workspaceId))
			.orderBy(desc(schema.category.createdAt), desc(schema.category.name));

		const result = queryData.map((data) => ({
			...data.category,
			workspace: data.workspace,
		}));

		return result;
	}

	async findOne(param: { id: string; workspaceId: string }) {
		const queryData = await db
			.select()
			.from(schema.category)
			.innerJoin(schema.workspace, eq(schema.category.workspaceId, schema.workspace.id))
			.where(
				and(eq(schema.category.id, param.id), eq(schema.category.workspaceId, param.workspaceId)),
			)
			.orderBy(desc(schema.category.createdAt))
			.limit(1);

		if (!queryData[0]) return null;

		const result = {
			...queryData[0].category,
			workspace: queryData[0].workspace,
		};

		return result;
	}

	async insert(param: Omit<NewCategory, "id">) {
		const [category] = await db
			.insert(schema.category)
			.values({
				id: generateId({ use: "uuid" }),
				...param,
			})
			.returning();

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

		if (!category) return null;

		return category;
	}
}
