import { generateId } from "@hoalu/common/generate-id";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "../../db";

type NewTask = typeof schema.task.$inferInsert;

export class TaskRepository {
	async findAllByWorkspaceId(param: { workspaceId: string }) {
		const queryData = await db
			.select()
			.from(schema.task)
			.innerJoin(schema.user, eq(schema.task.creatorId, schema.user.id))
			.innerJoin(schema.workspace, eq(schema.task.workspaceId, schema.workspace.id))
			.where(eq(schema.task.workspaceId, param.workspaceId))
			.orderBy(desc(schema.task.createdAt));

		const result = queryData.map((data) => ({
			...data.task,
			// owner: data.user,
			// workspace: data.workspace,
		}));

		return result;
	}

	async findOne(param: { id: string; workspaceId: string }) {
		const queryData = await db
			.select()
			.from(schema.task)
			.innerJoin(schema.user, eq(schema.task.creatorId, schema.user.id))
			.innerJoin(schema.workspace, eq(schema.task.workspaceId, schema.workspace.id))
			.where(and(eq(schema.task.id, param.id), eq(schema.task.workspaceId, param.workspaceId)))
			.orderBy(desc(schema.task.createdAt))
			.limit(1);

		if (!queryData[0]) return null;

		const result = {
			...queryData[0].task,
			// owner: queryData[0].user,
			// workspace: queryData[0].workspace,
		};

		return result;
	}

	async insert(param: Omit<NewTask, "id">) {
		const [task] = await db
			.insert(schema.task)
			.values({
				id: generateId({ use: "uuid" }),
				...param,
			})
			.returning();

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
			.where(eq(schema.task.id, param.id))
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

		if (!task) return null;

		return task;
	}
}
