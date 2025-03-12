import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from "drizzle-orm/pg-core";

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
