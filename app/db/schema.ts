import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	name: text().notNull(),
	age: integer().notNull(),
	email: text().notNull().unique(),
});
