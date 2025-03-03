import { sql } from "drizzle-orm";
import {
	boolean,
	date,
	index,
	numeric,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { workspace } from "./auth";
import { colorTypeEnum, levelEnum, repeatEnum, taskStatusEnum, walletTypeEnum } from "./enums";

export const category = pgTable(
	"category",
	{
		id: uuid("id").primaryKey(),
		name: text("name").notNull(),
		description: text("description"),
		color: colorTypeEnum().default("red").notNull(),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		unique("category_workspace_id_name_unique").on(table.workspaceId, table.name),
		index("category_workspace_id_idx").on(table.workspaceId),
	],
);

export const wallet = pgTable(
	"wallet",
	{
		id: uuid("id").primaryKey(),
		name: text("name").notNull(),
		description: text("description"),
		currency: varchar({ length: 3 }).notNull(),
		type: walletTypeEnum().default("cash").notNull(),
		ownerId: uuid("owner_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [index("wallet_workspace_id_idx").on(table.workspaceId)],
);

export const expense = pgTable(
	"expense",
	{
		id: uuid("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		date: timestamp("date", { mode: "string", withTimezone: true }).default(sql`now()`).notNull(),
		currency: varchar({ length: 3 }).notNull(),
		amount: numeric("amount", { precision: 20, scale: 6 }).notNull(),
		repeat: repeatEnum().default("one-time").notNull(),
		creatorId: uuid("creator_id")
			.notNull()
			.references(() => user.id, { onDelete: "set null" }),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		walletId: uuid("wallet_id")
			.notNull()
			.references(() => wallet.id),
		categoryId: uuid("category_id")
			.notNull()
			.references(() => category.id),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		index("expense_title_idx").using("gin", sql`to_tsvector('english', ${table.title})`),
		index("expense_description_idx").using(
			"gin",
			sql`to_tsvector('english', ${table.description})`,
		),
		index("expense_workspace_id_idx").on(table.workspaceId),
		index("expense_wallet_id_idx").on(table.walletId),
	],
);

export const task = pgTable(
	"task",
	{
		id: uuid("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		status: taskStatusEnum().default("todo").notNull(),
		priority: levelEnum().default("none").notNull(),
		creatorId: uuid("creator_id")
			.notNull()
			.references(() => user.id, { onDelete: "set null" }),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		dueDate: date("due_date", { mode: "string" }).default(sql`now() + INTERVAL '1 day'`).notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		index("task_title_idx").using("gin", sql`to_tsvector('english', ${table.title})`),
		index("task_workspace_id_idx").on(table.workspaceId),
	],
);
