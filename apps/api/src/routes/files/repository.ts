import { and, desc, eq, exists, inArray, or, sql } from "drizzle-orm";

import { db, schema } from "#api/db/index.ts";

type NewFile = typeof schema.file.$inferInsert;
type NewFileExpense = typeof schema.fileExpense.$inferInsert;

export interface FileCursor {
	createdAt: string;
	id: string;
}

export interface FileLink {
	expensePublicId: string;
	expenseTitle: string;
	expenseCategory: string | null;
	expenseBill: string | null;
	expenseAmount: number;
}

export class FileRepository {
	async findLinksByFileIds(param: { fileIds: string[]; workspaceId: string }) {
		const links = new Map<string, FileLink>();
		if (param.fileIds.length === 0) return links;

		const rows = await db
			.select({
				fileId: schema.fileExpense.fileId,
				expensePublicId: schema.expense.publicId,
				expenseTitle: schema.expense.title,
				expenseCategory: schema.category.name,
				expenseBill: schema.recurringBill.title,
				expenseAmount: schema.expense.amount,
			})
			.from(schema.fileExpense)
			.innerJoin(schema.expense, eq(schema.expense.id, schema.fileExpense.expenseId))
			.leftJoin(schema.category, eq(schema.category.id, schema.expense.categoryId))
			.leftJoin(schema.recurringBill, eq(schema.recurringBill.id, schema.expense.recurringBillId))
			.where(
				and(
					inArray(schema.fileExpense.fileId, param.fileIds),
					eq(schema.fileExpense.workspaceId, param.workspaceId),
				),
			)
			.orderBy(desc(schema.expense.date));

		for (const row of rows) {
			if (links.has(row.fileId)) continue;
			links.set(row.fileId, {
				expensePublicId: row.expensePublicId,
				expenseTitle: row.expenseTitle,
				expenseCategory: row.expenseCategory,
				expenseBill: row.expenseBill,
				expenseAmount: Number(row.expenseAmount),
			});
		}

		return links;
	}

	async findPage(param: { workspaceId: string; limit: number; cursor: FileCursor | null }) {
		const linkedToWorkspace = or(
			exists(
				db
					.select({ fileId: schema.fileExpense.fileId })
					.from(schema.fileExpense)
					.where(
						and(
							eq(schema.fileExpense.fileId, schema.file.id),
							eq(schema.fileExpense.workspaceId, param.workspaceId),
						),
					),
			),
			exists(
				db
					.select({ fileId: schema.fileTask.fileId })
					.from(schema.fileTask)
					.where(
						and(
							eq(schema.fileTask.fileId, schema.file.id),
							eq(schema.fileTask.workspaceId, param.workspaceId),
						),
					),
			),
		);

		const beforeCursor = param.cursor
			? sql`(${schema.file.createdAt}, ${schema.file.id}) < (${param.cursor.createdAt}::timestamptz, ${param.cursor.id}::uuid)`
			: undefined;

		const rows = await db
			.select()
			.from(schema.file)
			.where(and(linkedToWorkspace, beforeCursor))
			.orderBy(desc(schema.file.createdAt), desc(schema.file.id))
			.limit(param.limit + 1);

		const files = rows.slice(0, param.limit);
		const last = files.at(-1);
		const links = await this.findLinksByFileIds({
			fileIds: files.map((file) => file.id),
			workspaceId: param.workspaceId,
		});

		const [totals] = await db
			.select({
				images:
					sql<number>`count(*) filter (where coalesce(${schema.file.mimeType}, '') like 'image/%' or ${schema.file.name} like 'img\\_%')`.mapWith(
						Number,
					),
				files: sql<number>`count(*)`.mapWith(Number),
			})
			.from(schema.file)
			.where(linkedToWorkspace);

		return {
			files: files.map((file) => {
				const link = links.get(file.id);
				return {
					...file,
					expensePublicId: link?.expensePublicId ?? null,
					expenseTitle: link?.expenseTitle ?? null,
					expenseCategory: link?.expenseCategory ?? null,
					expenseBill: link?.expenseBill ?? null,
					expenseAmount: link?.expenseAmount ?? null,
				};
			}),
			nextCursor:
				rows.length > param.limit && last ? { createdAt: last.createdAt, id: last.id } : null,
			totals: { images: totals?.images ?? 0, files: totals?.files ?? 0 },
		};
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

	async findAllByExpenseId(param: { expenseId: string; workspaceId: string }) {
		const fileExpenseRecords = await db
			.select()
			.from(schema.fileExpense)
			.where(
				and(
					eq(schema.fileExpense.expenseId, param.expenseId),
					eq(schema.fileExpense.workspaceId, param.workspaceId),
				),
			);

		if (fileExpenseRecords.length === 0) {
			return [];
		}

		const fileIds = fileExpenseRecords.map((fe) => fe.fileId);
		const files = await db.select().from(schema.file).where(inArray(schema.file.id, fileIds));

		return files;
	}

	async deleteFileExpense(param: { fileId: string; expenseId: string; workspaceId: string }) {
		const [fileExpense] = await db
			.select()
			.from(schema.fileExpense)
			.where(
				and(
					eq(schema.fileExpense.fileId, param.fileId),
					eq(schema.fileExpense.expenseId, param.expenseId),
					eq(schema.fileExpense.workspaceId, param.workspaceId),
				),
			)
			.limit(1);

		if (!fileExpense) {
			return null;
		}

		const [file] = await db
			.select()
			.from(schema.file)
			.where(eq(schema.file.id, param.fileId))
			.limit(1);

		if (!file) {
			return null;
		}

		await db
			.delete(schema.fileExpense)
			.where(
				and(
					eq(schema.fileExpense.fileId, param.fileId),
					eq(schema.fileExpense.expenseId, param.expenseId),
					eq(schema.fileExpense.workspaceId, param.workspaceId),
				),
			);

		await db.delete(schema.file).where(eq(schema.file.id, param.fileId));

		return file;
	}
}
