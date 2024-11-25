import { serverEnv } from "@/env";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

export function createNodePostgresClient() {
	const client = new pg.Pool({ connectionString: serverEnv.DATABASE_URL });
	const db = drizzle({ client });
	return db;
}
