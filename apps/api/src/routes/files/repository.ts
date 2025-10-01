import { eq, inArray } from "drizzle-orm";

import { db, schema } from "../../db";

type NewFile = typeof schema.file.$inferInsert;
type NewFileExpense = typeof schema.fileExpense.$inferInsert;

export class FileRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		const expenseSubquery = db
			.select({ fileId: schema.fileExpense.fileId })
			.from(schema.fileExpense)
			.where(eq(schema.fileExpense.workspaceId, param.workspaceId))
			.as("file_expense_subquery");

		const taskSubquery = db
			.select({ fileId: schema.fileTask.fileId })
			.from(schema.fileTask)
			.where(eq(schema.fileTask.workspaceId, param.workspaceId))
			.as("file_task_subquery");

		const combinedIds = await db
			.selectDistinct({ fileId: expenseSubquery.fileId })
			.from(expenseSubquery)
			.union(db.selectDistinct({ fileId: taskSubquery.fileId }).from(taskSubquery));

		if (combinedIds.length === 0) {
			return [];
		}

		const fileIds = combinedIds.map((item) => item.fileId);
		const files = await db.select().from(schema.file).where(inArray(schema.file.id, fileIds));

		return files;
	}

	async findOne(param: { id: string }) {
		const [result] = await db
			.select()
			.from(schema.file)
			.where(eq(schema.file.id, param.id))
			.limit(1);

		return result || null;
	}

	async insert(param: NewFile) {
		const [result] = await db.insert(schema.file).values(param).returning();
		return result;
	}

	async insertFileExpense(param: NewFileExpense[]) {
		const result = await db.insert(schema.fileExpense).values(param).returning();
		return result;
	}
}
