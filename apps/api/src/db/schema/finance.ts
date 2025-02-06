import { sql } from "drizzle-orm";
import {
	bigint,
	foreignKey,
	index,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { member, workspace } from "./workspace";

export const walletTypeEnum = pgEnum("wallet_type_enum", [
	"cash",
	"bank-account",
	"credit-card",
	"debit-card",
	"digital-account",
]);

export const wallet = pgTable("wallet", {
	id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
	publicId: text("public_id").notNull().unique(),
	name: text("name").notNull(),
	description: text("description"),
	currency: varchar({ length: 3 }).notNull(),
	type: walletTypeEnum().default("cash").notNull(),
	workspaceId: bigint("workspace_id", { mode: "number" })
		.notNull()
		.references(() => workspace.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const category = pgTable(
	"category",
	{
		id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
		name: text("name").notNull(),
		description: text("description"),
		color: text("color"),
		workspaceId: bigint("workspace_id", { mode: "number" })
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [unique("category_workspace_id_name_unique").on(table.workspaceId, table.name)],
);

export const expense = pgTable(
	"expense",
	{
		id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
		title: text("title").notNull(),
		description: text("description"),
		date: timestamp("date", { withTimezone: true }).default(sql`now()`).notNull(),
		currency: varchar({ length: 3 }).notNull(),
		amount: numeric("amount", { precision: 20, scale: 6 }).notNull(),
		creatorId: bigint("creator_id", { mode: "number" }).notNull(),
		workspaceId: bigint("workspace_id", { mode: "number" }).notNull(),
		walletId: bigint("wallet_id", { mode: "number" })
			.notNull()
			.references(() => wallet.id, { onDelete: "cascade" }),
		categoryId: bigint("category_id", { mode: "number" })
			.notNull()
			.references(() => category.id),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.workspaceId, table.creatorId],
			foreignColumns: [member.workspaceId, member.userId],
			name: "expense_member_fk",
		}),
		index("expense_title_idx").using("gin", sql`to_tsvector('english', ${table.title})`),
	],
);
