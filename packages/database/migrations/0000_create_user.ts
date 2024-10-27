import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<any>) {
	await db.schema
		.createTable("user")
		.addColumn("id", "text", (col) => col.primaryKey())
		.addColumn("email", "text", (col) => col.unique().notNull())
		.addColumn("username", "text", (col) => col.unique().notNull())
		.addColumn("created_at", "timestamp", (col) =>
			col.defaultTo(sql`now()`).notNull(),
		)
		.addColumn("updated_at", "timestamp", (col) =>
			col.defaultTo(sql`now()`).notNull(),
		)
		.execute();
}

export async function down(db: Kysely<any>) {
	await db.schema.dropTable("user").ifExists().execute();
}
