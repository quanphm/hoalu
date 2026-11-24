import { and, desc, eq, sql } from "drizzle-orm";

import { db, schema } from "#api/db/index.ts";

import type { Transaction } from "#api/lib/xact-id.ts";

type NewEvent = typeof schema.event.$inferInsert;

export class EventRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		return db
			.select()
			.from(schema.event)
			.where(eq(schema.event.workspaceId, param.workspaceId))
			.orderBy(desc(schema.event.createdAt));
	}

	async findOne(param: { id: string; workspaceId: string }, tx?: Transaction) {
		const [result] = await (tx ?? db)
			.select()
			.from(schema.event)
			.where(and(eq(schema.event.id, param.id), eq(schema.event.workspaceId, param.workspaceId)));
		return result ?? null;
	}

	async insert(param: NewEvent, tx?: Transaction) {
		const [result] = await (tx ?? db)
			.insert(schema.event)
			.values(param)
			.onConflictDoNothing({ target: schema.event.id })
			.returning();

		return result ?? null;
	}

	async update<T>(param: { id: string; workspaceId: string; payload: T }, tx?: Transaction) {
		const [result] = await (tx ?? db)
			.update(schema.event)
			.set({ ...param.payload, updatedAt: sql`now()` })
			.where(and(eq(schema.event.id, param.id), eq(schema.event.workspaceId, param.workspaceId)))
			.returning();

		return result ?? null;
	}

	async delete(param: { id: string; workspaceId: string }, tx?: Transaction) {
		await (tx ?? db)
			.delete(schema.event)
			.where(and(eq(schema.event.id, param.id), eq(schema.event.workspaceId, param.workspaceId)));

		return { id: param.id };
	}
}
