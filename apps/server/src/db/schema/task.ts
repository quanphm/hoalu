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
			.references(() => user.id),
		createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
		updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
	},
	(table) => [index("idx_task_name").on(table.name)],
);
