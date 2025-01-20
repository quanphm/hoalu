import { sql } from "drizzle-orm";
import { bigint, boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const task = pgTable(
	"task",
	{
		id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
		name: text("name").notNull(),
		done: boolean("done").notNull(),
		userId: bigint("user_id", { mode: "number" })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
	},
	(table) => [index("idx_task_on_name").using("gin", sql`to_tsvector('english', ${table.name})`)],
);
