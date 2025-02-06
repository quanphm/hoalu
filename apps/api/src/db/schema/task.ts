import { sql } from "drizzle-orm";
import { bigint, boolean, foreignKey, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { member } from "./workspace";

export const task = pgTable(
	"task",
	{
		id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
		name: text("name").notNull(),
		done: boolean("done").notNull(),
		creatorId: bigint("creator_id", { mode: "number" }).notNull(),
		workspaceId: bigint("workspace_id", { mode: "number" }).notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.workspaceId, table.creatorId],
			foreignColumns: [member.workspaceId, member.userId],
			name: "task_member_fk",
		}),
		index("task_name_idx").using("gin", sql`to_tsvector('english', ${table.name})`),
	],
);
