import { bigint, boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { number } from "valibot";

export const userTable = pgTable("user", {
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull(),
	email: text().notNull().unique(),
	email_verified: boolean().notNull(),
	image: text(),
	public_id: text().notNull(),
	created_at: timestamp().notNull(),
	updated_at: timestamp().notNull(),
});

export const sessionTable = pgTable("session", {
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
	expires_at: timestamp().notNull(),
	token: text().notNull().unique(),
	created_at: timestamp().notNull(),
	updated_at: timestamp().notNull(),
	ip_address: text(),
	user_agent: text(),
	user_id: bigint({ mode: "number" })
		.notNull()
		.references(() => userTable.id),
});

export const accountTable = pgTable("account", {
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
	account_id: text().notNull(),
	provider_id: text().notNull(),
	user_id: bigint({ mode: "number" })
		.notNull()
		.references(() => userTable.id),
	access_token: text(),
	refresh_token: text(),
	id_token: text(),
	access_token_expires_at: timestamp(),
	refresh_token_expires_at: timestamp(),
	scope: text(),
	password: text(),
	created_at: timestamp().notNull(),
	updated_at: timestamp().notNull(),
});

export const verificationTable = pgTable("verification", {
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
	identifier: text().notNull(),
	value: text().notNull(),
	expires_at: timestamp().notNull(),
	created_at: timestamp(),
	updated_at: timestamp(),
});
