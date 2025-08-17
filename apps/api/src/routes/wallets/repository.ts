import { and, count, desc, eq, getTableColumns, sql } from "drizzle-orm";

import { generateId } from "@hoalu/common/generate-id";
import { db, schema } from "../../db";
import type { UpdateWalletSchema } from "./schema";

const schemaColumns = getTableColumns(schema.wallet);

type NewWallet = typeof schema.wallet.$inferInsert;

export class WalletRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		const queryData = await db
			.select({
				...schemaColumns,
				owner: schema.user,
				workspace: schema.workspace,
				total: count(schema.expense.id),
			})
			.from(schema.wallet)
			.innerJoin(schema.user, eq(schema.wallet.ownerId, schema.user.id))
			.innerJoin(schema.workspace, eq(schema.wallet.workspaceId, schema.workspace.id))
			.leftJoin(schema.expense, eq(schema.wallet.id, schema.expense.walletId))
			.where(eq(schema.wallet.workspaceId, param.workspaceId))
			.groupBy(schema.wallet.id, schema.user.id, schema.workspace.id)
			.orderBy((result) => {
				return [desc(result.total), desc(result.name)];
			});

		return queryData;
	}

	async findOne(param: { id: string; workspaceId: string }) {
		const queryData = await db
			.select({
				...schemaColumns,
				owner: schema.user,
				workspace: schema.workspace,
				total: count(schema.expense.id),
			})
			.from(schema.wallet)
			.innerJoin(schema.user, eq(schema.wallet.ownerId, schema.user.id))
			.innerJoin(schema.workspace, eq(schema.wallet.workspaceId, schema.workspace.id))
			.leftJoin(schema.expense, eq(schema.wallet.id, schema.expense.walletId))
			.where(and(eq(schema.wallet.id, param.id), eq(schema.wallet.workspaceId, param.workspaceId)))
			.groupBy(schema.wallet.id, schema.user.id, schema.workspace.id)
			.orderBy(desc(schema.wallet.createdAt))
			.limit(1);

		if (!queryData[0]) return null;

		return queryData[0];
	}

	async insert(param: Omit<NewWallet, "id">) {
		const [wallet] = await db
			.insert(schema.wallet)
			.values({
				id: generateId({ use: "uuid" }),
				...param,
			})
			.returning();

		const result = await this.findOne({ id: wallet.id, workspaceId: wallet.workspaceId });
		return result;
	}

	async update<T extends typeof UpdateWalletSchema.infer>(param: {
		id: string;
		workspaceId: string;
		payload: T;
	}) {
		const [wallet] = await db
			.update(schema.wallet)
			.set({
				updatedAt: sql`now()`,
				...param.payload,
			})
			.where(eq(schema.wallet.id, param.id))
			.returning();

		if (!wallet) return null;

		const result = await this.findOne({ id: wallet.id, workspaceId: wallet.workspaceId });
		return result;
	}

	async delete(param: { id: string; workspaceId: string }) {
		const [wallet] = await db
			.delete(schema.wallet)
			.where(eq(schema.wallet.id, param.id))
			.returning();

		if (!wallet) return null;

		return wallet;
	}
}
