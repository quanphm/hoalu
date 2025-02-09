import { sql } from "drizzle-orm";
import { boolean, foreignKey, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { member } from "./workspace";

export const task = pgTable(
	"task",
	{
		id: uuid("id").primaryKey(),
		name: text("name").notNull(),
		done: boolean("done").notNull(),
		creatorId: uuid("creator_id").notNull(),
		workspaceId: uuid("workspace_id").notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			name: "task_member_fk",
			columns: [table.workspaceId, table.creatorId],
			foreignColumns: [member.workspaceId, member.userId],
		}).onDelete("cascade"),
		index("task_name_idx").using("gin", sql`to_tsvector('english', ${table.name})`),
	],
);
