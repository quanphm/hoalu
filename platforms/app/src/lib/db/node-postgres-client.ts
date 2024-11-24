import { serverEnv } from "@/env";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

export function createNodePostgresClient() {
	const client = new pg.Pool({
		connectionString: serverEnv.DATABASE_URL,
	});
	return drizzle({ client });
}
