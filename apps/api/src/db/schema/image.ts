import { sql } from "drizzle-orm";
import { pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { expense } from "./finance";
import { task } from "./task";
import { workspace } from "./workspace";

export const image = pgTable("image", {
	id: uuid("id").primaryKey(),
	fileName: text("file_name").notNull(),
	s3Url: text("s3_url").notNull(),
	description: text("description"),
	tags: text("tags").array().default(sql`ARRAY[]::text[]`),
	workspaceId: uuid("workspace_id").references(() => workspace.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

export const imageExpense = pgTable(
	"image_expense",
	{
		expenseId: uuid("expense_id").references(() => expense.id, { onDelete: "cascade" }),
		imageId: uuid("image_id").references(() => image.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.expenseId, table.imageId] })],
);

export const imageTask = pgTable(
	"image_task",
	{
		taskId: uuid("task_id").references(() => task.id, { onDelete: "cascade" }),
		imageId: uuid("image_id").references(() => image.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.taskId, table.imageId] })],
);
