import { serverEnv } from "@/env";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

export async function createNodePostgresClient() {
	const client = new pg.Pool({
		connectionString: serverEnv.DATABASE_URL,
	});
	const db = drizzle({ client });
	return db;
}
