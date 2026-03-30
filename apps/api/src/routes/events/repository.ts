import { db, schema } from "#api/db/index.ts";
import { and, desc, eq, sql } from "drizzle-orm";

type NewEvent = typeof schema.event.$inferInsert;

export class EventRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		return db
			.select()
			.from(schema.event)
			.where(eq(schema.event.workspaceId, param.workspaceId))
			.orderBy(desc(schema.event.createdAt));
	}

	async findOne(param: { id: string; workspaceId: string }) {
		const [result] = await db
			.select()
			.from(schema.event)
			.where(and(eq(schema.event.id, param.id), eq(schema.event.workspaceId, param.workspaceId)));
		return result ?? null;
	}

	async insert(param: NewEvent) {
		try {
			const [result] = await db.insert(schema.event).values(param).returning();
			return result;
		} catch (_error) {
			console.log(_error);
			return null;
		}
	}

	async update<T>(param: { id: string; workspaceId: string; payload: T }) {
		try {
			const [result] = await db
				.update(schema.event)
				.set({ ...param.payload, updatedAt: sql`now()` })
				.where(and(eq(schema.event.id, param.id), eq(schema.event.workspaceId, param.workspaceId)))
				.returning();
			return result ?? null;
		} catch (_error) {
			return null;
		}
	}

	async delete(param: { id: string; workspaceId: string }) {
		await db
			.delete(schema.event)
			.where(and(eq(schema.event.id, param.id), eq(schema.event.workspaceId, param.workspaceId)));
		return { id: param.id };
	}
}
