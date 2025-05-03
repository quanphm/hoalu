import { generateId } from "@hoalu/common/generate-id";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "../../db";
import type { UpdateWalletSchema } from "./schema";

type NewWallet = typeof schema.wallet.$inferInsert;

export class WalletRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		const queryData = await db
			.select()
			.from(schema.wallet)
			.innerJoin(schema.user, eq(schema.wallet.ownerId, schema.user.id))
			.innerJoin(schema.workspace, eq(schema.wallet.workspaceId, schema.workspace.id))
			.where(eq(schema.wallet.workspaceId, param.workspaceId))
			.orderBy(desc(schema.wallet.createdAt));

		const result = queryData.map((data) => ({
			...data.wallet,
			owner: data.user,
			workspace: data.workspace,
		}));

		return result;
	}

	async findOne(param: { id: string; workspaceId: string }) {
		const queryData = await db
			.select()
			.from(schema.wallet)
			.innerJoin(schema.user, eq(schema.wallet.ownerId, schema.user.id))
			.innerJoin(schema.workspace, eq(schema.wallet.workspaceId, schema.workspace.id))
			.where(and(eq(schema.wallet.id, param.id), eq(schema.wallet.workspaceId, param.workspaceId)))
			.orderBy(desc(schema.wallet.createdAt))
			.limit(1);

		if (!queryData[0]) return null;

		const result = {
			...queryData[0].wallet,
			owner: queryData[0].user,
			workspace: queryData[0].workspace,
		};

		return result;
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
