import { sql } from "drizzle-orm";
import {
	boolean,
	foreignKey,
	index,
	numeric,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { colorTypeEnum, walletTypeEnum } from "./enums";
import { member, workspace } from "./workspace";

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
	(table) => [unique("category_workspace_id_name_unique").on(table.workspaceId, table.name)],
);

export const wallet = pgTable(
	"wallet",
	{
		id: uuid("id").primaryKey(),
		name: text("name").notNull(),
		description: text("description"),
		currency: varchar({ length: 3 }).notNull(),
		type: walletTypeEnum().default("cash").notNull(),
		ownerId: uuid("owner_id").notNull(),
		workspaceId: uuid("workspace_id").notNull(),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			name: "expense_member_fk",
			columns: [table.workspaceId, table.ownerId],
			foreignColumns: [member.workspaceId, member.userId],
		}).onDelete("cascade"),
	],
);

export const expense = pgTable(
	"expense",
	{
		id: uuid("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		date: timestamp("date", { withTimezone: true }).default(sql`now()`).notNull(),
		currency: varchar({ length: 3 }).notNull(),
		amount: numeric("amount", { precision: 20, scale: 6 }).notNull(),
		creatorId: uuid("creator_id").notNull(),
		workspaceId: uuid("workspace_id").notNull(),
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
		foreignKey({
			name: "expense_member_fk",
			columns: [table.workspaceId, table.creatorId],
			foreignColumns: [member.workspaceId, member.userId],
		}).onDelete("cascade"),
		index("expense_title_idx").using("gin", sql`to_tsvector('english', ${table.title})`),
	],
);
