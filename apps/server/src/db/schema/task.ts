import { boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const task = pgTable(
	"task",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		name: text("name").notNull(),
		done: boolean("done").notNull(),
		userId: integer("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
	},
	(table) => [index("idx_task_name").on(table.name)],
);
