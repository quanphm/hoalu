import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";

import { db, schema } from "#api/db/index.ts";

const schemaColumns = getTableColumns(schema.task);

type NewTask = typeof schema.task.$inferInsert;

export class TaskRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		const queryData = await db
			.select(schemaColumns)
			.from(schema.task)
			.innerJoin(schema.user, eq(schema.task.creatorId, schema.user.id))
			.where(eq(schema.task.workspaceId, param.workspaceId))
			.orderBy(desc(schema.task.createdAt));

		return queryData;
	}

	async findOne(param: { id: string; workspaceId: string }) {
		const [result] = await db
			.select(schemaColumns)
			.from(schema.task)
			.innerJoin(schema.user, eq(schema.task.creatorId, schema.user.id))
			.where(and(eq(schema.task.id, param.id), eq(schema.task.workspaceId, param.workspaceId)))
			.orderBy(desc(schema.task.createdAt))
			.limit(1);

		return result || null;
	}

	async insert(param: NewTask) {
		const [task] = await db.insert(schema.task).values(param).returning();
		const result = await this.findOne({ id: task.id, workspaceId: task.workspaceId });
		return result;
	}

	async update<T>(param: { id: string; workspaceId: string; payload: T }) {
		const [task] = await db
			.update(schema.task)
			.set({
				updatedAt: sql`now()`,
				...param.payload,
			})
			.where(and(eq(schema.task.id, param.id), eq(schema.task.workspaceId, param.workspaceId)))
			.returning();

		if (!task) return null;

		const result = await this.findOne({ id: task.id, workspaceId: task.workspaceId });
		return result;
	}

	async delete(param: { id: string; workspaceId: string }) {
		const [task] = await db
			.delete(schema.task)
			.where(and(eq(schema.task.id, param.id), eq(schema.task.workspaceId, param.workspaceId)))
			.returning();

		if (!task) return { id: param.id };

		return { id: task.id };
	}
}
