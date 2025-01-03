import { bigint, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
	id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
	public_id: text().notNull().unique(),
	username: text().notNull().unique(),
	email: text().notNull().unique(),
	created_at: timestamp().notNull().defaultNow(),
	updated_at: timestamp().notNull().defaultNow(),
});
