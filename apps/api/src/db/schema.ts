import {
	PG_ENUM_COLOR,
	PG_ENUM_PRIORITY,
	PG_ENUM_REPEAT,
	PG_ENUM_TASK_STATUS,
	PG_ENUM_WALLET_TYPE,
} from "@hoalu/common/enums";
import { sql } from "drizzle-orm";
import {
	boolean,
	date,
	index,
	integer,
	jsonb,
	numeric,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";

/**
 * auth
 */
export const user = pgTable("user", {
	id: uuid("id").primaryKey(),
	publicId: text("public_id").notNull().unique(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable(
	"session",
	{
		id: uuid("id").primaryKey(),
		token: text("token").notNull().unique(),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").notNull(),
		updatedAt: timestamp("updated_at").notNull(),
	},
	(table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable("account", {
	id: uuid("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: uuid("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});

export const jwks = pgTable("jwks", {
	id: text("id").primaryKey(),
	publicKey: text("public_key").notNull(),
	privateKey: text("private_key").notNull(),
	createdAt: timestamp("created_at").notNull(),
});

export const workspace = pgTable(
	"workspace",
	{
		id: uuid("id").primaryKey(),
		slug: text("slug").notNull().unique(),
		publicId: text("public_id").notNull().unique(),
		name: text("name").notNull(),
		logo: text("logo"),
		metadata: jsonb("metadata").$type<Record<string, any>>().default({}).notNull(),
		createdAt: timestamp("created_at").notNull(),
	},
	(table) => [
		index("workspace_name_idx").on(table.name),
		index("workspace_metadata_idx").using("gin", table.metadata),
	],
);

export const member = pgTable(
	"member",
	{
		id: uuid("id").primaryKey(),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role").notNull(),
		createdAt: timestamp("created_at").notNull(),
	},
	(table) => [unique("member_on_workspace_id_user_id_unique").on(table.workspaceId, table.userId)],
);

export const invitation = pgTable("invitation", {
	id: uuid("id").primaryKey(),
	email: text("email").notNull(),
	role: text("role"),
	status: text("status").notNull(),
	workspaceId: uuid("workspace_id")
		.notNull()
		.references(() => workspace.id, { onDelete: "cascade" }),
	inviterId: uuid("inviter_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	expiresAt: timestamp("expires_at").notNull(),
});

export const apikey = pgTable("apikey", {
	id: uuid("id").primaryKey(),
	name: text("name"),
	start: text("start"),
	prefix: text("prefix"),
	key: text("key").notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	refillInterval: integer("refill_interval"),
	refillAmount: integer("refill_amount"),
	lastRefillAt: timestamp("last_refill_at"),
	enabled: boolean("enabled"),
	rateLimitEnabled: boolean("rate_limit_enabled"),
	rateLimitTimeWindow: integer("rate_limit_time_window"),
	rateLimitMax: integer("rate_limit_max"),
	requestCount: integer("request_count"),
	remaining: integer("remaining"),
	lastRequest: timestamp("last_request"),
	expiresAt: timestamp("expires_at"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	permissions: text("permissions"),
	metadata: text("metadata"),
});

/**
 * core
 */

export const colorTypeEnum = pgEnum("color_enum", PG_ENUM_COLOR);
export const walletTypeEnum = pgEnum("wallet_type_enum", PG_ENUM_WALLET_TYPE);
export const priorityEnum = pgEnum("priority_enum", PG_ENUM_PRIORITY);
export const taskStatusEnum = pgEnum("task_status_enum", PG_ENUM_TASK_STATUS);
export const repeatEnum = pgEnum("repeat_enum", PG_ENUM_REPEAT);

export const fxRate = pgTable(
	"fx_rate",
	{
		fromCurrency: varchar("from_currency", { length: 3 }).notNull(),
		toCurrency: varchar("to_currency", { length: 3 }).notNull(),
		exchangeRate: numeric("exchange_rate", { precision: 18, scale: 6 }).notNull(),
		inverseRate: numeric("inverse_rate", { precision: 18, scale: 6 }).notNull(),
		validFrom: date("valid_from", { mode: "string" }).defaultNow().notNull(),
		validTo: date("valid_to", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		primaryKey({
			columns: [table.fromCurrency, table.toCurrency, table.exchangeRate, table.validFrom],
		}),
	],
);

export const category = pgTable(
	"category",
	{
		id: uuid("id").primaryKey(),
		name: text("name").notNull(),
		description: text("description"),
		color: colorTypeEnum().default("gray").notNull(),
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
			.references(() => wallet.id, { onDelete: "cascade" }),
		categoryId: uuid("category_id").references(() => category.id, { onDelete: "set null" }),
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
		priority: priorityEnum().default("none").notNull(),
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

/**
 * image
 */

export const image = pgTable(
	"image",
	{
		id: uuid("id").primaryKey(),
		fileName: text("file_name").notNull(),
		s3Url: text("s3_url").notNull(),
		description: text("description"),
		tags: text("tags").array().default(sql`ARRAY[]::text[]`),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [index("image_workspace_id_idx").on(table.workspaceId)],
);

export const imageExpense = pgTable(
	"image_expense",
	{
		expenseId: uuid("expense_id")
			.notNull()
			.references(() => expense.id, { onDelete: "cascade" }),
		imageId: uuid("image_id")
			.notNull()
			.references(() => image.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.expenseId, table.imageId] })],
);

export const imageTask = pgTable(
	"image_task",
	{
		taskId: uuid("task_id")
			.notNull()
			.references(() => task.id, { onDelete: "cascade" }),
		imageId: uuid("image_id")
			.notNull()
			.references(() => image.id, { onDelete: "cascade" }),
	},
	(table) => [primaryKey({ columns: [table.taskId, table.imageId] })],
);
