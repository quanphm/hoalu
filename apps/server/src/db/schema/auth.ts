import { boolean, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	publicId: text("public_id").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable(
	"session",
	{
		id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
		token: text("token").notNull().unique(),
		userId: integer("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").notNull(),
		updatedAt: timestamp("updated_at").notNull(),
	},
	(table) => [index("idx_session_user_id").on(table.userId)],
);

export const account = pgTable("account", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: integer("user_id")
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
	id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
});
