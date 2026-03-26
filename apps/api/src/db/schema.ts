import {
	PG_ENUM_CATEGORY_TYPE,
	PG_ENUM_COLOR,
	PG_ENUM_EVENT_STATUS,
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
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

/**
 * ----------------
 * better-auth
 * ----------------
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
	id: text("id").primaryKey(),
	configId: text("config_id").notNull(),
	name: text("name"),
	start: text("start"),
	prefix: text("prefix"),
	key: text("key").notNull(),
	referenceId: text("reference_id").notNull(),
	refillInterval: integer("refill_interval"),
	refillAmount: integer("refill_amount"),
	lastRefillAt: timestamp("last_refill_at", { precision: 6, withTimezone: true }),
	enabled: boolean("enabled").notNull(),
	rateLimitEnabled: boolean("rate_limit_enabled").notNull(),
	rateLimitTimeWindow: integer("rate_limit_time_window"),
	rateLimitMax: integer("rate_limit_max"),
	requestCount: integer("request_count").notNull(),
	remaining: integer("remaining"),
	lastRequest: timestamp("last_request", { precision: 6, withTimezone: true }),
	expiresAt: timestamp("expires_at", { precision: 6, withTimezone: true }),
	createdAt: timestamp("created_at", { precision: 6, withTimezone: true }).notNull(),
	updatedAt: timestamp("updated_at", { precision: 6, withTimezone: true }).notNull(),
	permissions: text("permissions"),
});

/**
 * ----------------
 * core
 * ----------------
 */

export const colorTypeEnum = pgEnum("color_enum", PG_ENUM_COLOR);
export const walletTypeEnum = pgEnum("wallet_type_enum", PG_ENUM_WALLET_TYPE);
export const priorityEnum = pgEnum("priority_enum", PG_ENUM_PRIORITY);
export const taskStatusEnum = pgEnum("task_status_enum", PG_ENUM_TASK_STATUS);
export const repeatEnum = pgEnum("repeat_enum", PG_ENUM_REPEAT);
export const categoryTypeEnum = pgEnum("category_type_enum", PG_ENUM_CATEGORY_TYPE);
export const eventStatusEnum = pgEnum("event_status_enum", PG_ENUM_EVENT_STATUS);

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
		type: categoryTypeEnum().default("expense").notNull(),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		unique("category_workspace_name_type_unique").on(table.workspaceId, table.name, table.type),
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

export const recurringBill = pgTable(
	"recurring_bill",
	{
		id: uuid("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		amount: numeric("amount", { precision: 20, scale: 6 }).notNull(),
		currency: varchar({ length: 3 }).notNull(),
		repeat: repeatEnum().notNull(),
		anchorDate: date("anchor_date", { mode: "string" }).notNull(),
		dueDay: integer("due_day"), // monthly: day-of-month (1-31), weekly: day-of-week (0=Sun..6=Sat)
		dueMonth: integer("due_month"), // yearly only: month (1-12)
		walletId: uuid("wallet_id")
			.notNull()
			.references(() => wallet.id, { onDelete: "cascade" }),
		categoryId: uuid("category_id").references(() => category.id, { onDelete: "set null" }),
		eventId: uuid("event_id").references(() => event.id, { onDelete: "set null" }),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		creatorId: uuid("creator_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		index("recurring_bill_workspace_id_idx").on(table.workspaceId),
		index("recurring_bill_wallet_id_idx").on(table.walletId),
		index("recurring_bill_event_id_idx").on(table.eventId),
	],
);

export const recurringBillOccurrence = pgTable(
	"recurring_bill_occurrence",
	{
		id: uuid("id").primaryKey(),
		recurringBillId: uuid("recurring_bill_id")
			.notNull()
			.references(() => recurringBill.id, { onDelete: "cascade" }),
		dueDate: date("due_date", { mode: "string" }).notNull(),
		expenseId: uuid("expense_id").references(() => expense.id, { onDelete: "set null" }),
		paidAt: timestamp("paid_at", { mode: "string" }),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		index("rbo_recurring_bill_id_idx").on(table.recurringBillId),
		index("rbo_due_date_idx").on(table.dueDate),
		index("rbo_expense_id_idx").on(table.expenseId),
		index("rbo_unpaid_idx")
			.on(table.recurringBillId, table.dueDate)
			.where(sql`${table.expenseId} IS NULL`),
	],
);

export const expense = pgTable(
	"expense",
	{
		id: uuid("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		date: timestamp("date", { mode: "string", withTimezone: true })
			.default(sql`now()`)
			.notNull(),
		currency: varchar({ length: 3 }).notNull(),
		amount: numeric("amount", { precision: 20, scale: 6 }).notNull(),
		repeat: repeatEnum().default("one-time").notNull(),
		recurringBillId: uuid("recurring_bill_id").references(() => recurringBill.id, {
			onDelete: "set null",
		}),
		eventId: uuid("event_id").references(() => event.id, { onDelete: "set null" }),
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
		index("expense_title_idx").using("gin", sql`to_tsvector('simple', ${table.title})`),
		index("expense_description_idx").using("gin", sql`to_tsvector('simple', ${table.description})`),
		index("expense_workspace_id_idx").on(table.workspaceId),
		index("expense_wallet_id_idx").on(table.walletId),
		index("expense_recurring_bill_id_idx").on(table.recurringBillId),
		index("expense_event_id_idx").on(table.eventId),
	],
);

export const income = pgTable(
	"income",
	{
		id: uuid("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		date: timestamp("date", { mode: "string", withTimezone: true }).defaultNow().notNull(),
		currency: varchar("currency", { length: 3 }).notNull(),
		amount: numeric("amount", { precision: 20, scale: 6 }).notNull(),
		repeat: repeatEnum("repeat").default("one-time").notNull(),
		creatorId: uuid("creator_id").references(() => user.id, { onDelete: "set null" }),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		walletId: uuid("wallet_id")
			.notNull()
			.references(() => wallet.id, { onDelete: "cascade" }),
		categoryId: uuid("category_id").references(() => category.id, { onDelete: "set null" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		index("income_title_idx").using("gin", sql`to_tsvector('simple', ${table.title})`),
		index("income_description_idx").using("gin", sql`to_tsvector('simple', ${table.description})`),
		index("income_workspace_id_idx").on(table.workspaceId),
		index("income_wallet_id_idx").on(table.walletId),
		index("income_date_idx").on(table.date),
	],
);

export const event = pgTable(
	"event",
	{
		id: uuid("id").primaryKey(),
		title: text("title").notNull(),
		description: text("description"),
		startDate: date("start_date", { mode: "string" }),
		endDate: date("end_date", { mode: "string" }),
		budget: numeric("budget", { precision: 20, scale: 6 }),
		currency: varchar("currency", { length: 3 }).notNull(),
		status: eventStatusEnum().default("open").notNull(),
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		creatorId: uuid("creator_id").references(() => user.id, { onDelete: "set null" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [
		index("event_title_idx").using("gin", sql`to_tsvector('simple', ${table.title})`),
		index("event_description_idx").using("gin", sql`to_tsvector('simple', ${table.description})`),
		index("event_workspace_id_idx").on(table.workspaceId),
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
		dueDate: date("due_date", { mode: "string" })
			.default(sql`now() + INTERVAL '1 day'`)
			.notNull(),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		index("task_title_idx").using("gin", sql`to_tsvector('simple', ${table.title})`),
		index("task_workspace_id_idx").on(table.workspaceId),
	],
);

/**
 * ----------------
 * files
 * ----------------
 */

export const file = pgTable(
	"file",
	{
		id: uuid("id").primaryKey(),
		name: text("name").notNull().unique(),
		s3Url: text("s3_url").notNull(),
		description: text("description"),
		tags: text("tags")
			.array()
			.default(sql`ARRAY[]::text[]`),
		createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		index("file_s3_url_idx").on(table.s3Url),
		index("file_description_idx").using("gin", sql`to_tsvector('simple', ${table.description})`),
	],
);

export const fileExpense = pgTable(
	"file_expense",
	{
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		expenseId: uuid("expense_id")
			.notNull()
			.references(() => expense.id, { onDelete: "cascade" }),
		fileId: uuid("file_id")
			.notNull()
			.references(() => file.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.workspaceId, table.expenseId, table.fileId] }),
		index("file_expense_workspace_id_idx").on(table.workspaceId),
	],
);

export const fileTask = pgTable(
	"file_task",
	{
		workspaceId: uuid("workspace_id")
			.notNull()
			.references(() => workspace.id, { onDelete: "cascade" }),
		taskId: uuid("task_id")
			.notNull()
			.references(() => task.id, { onDelete: "cascade" }),
		fileId: uuid("file_id")
			.notNull()
			.references(() => file.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.workspaceId, table.taskId, table.fileId] }),
		index("file_task_workspace_id_idx").on(table.workspaceId),
	],
);
