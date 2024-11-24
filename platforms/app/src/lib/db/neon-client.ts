import { serverEnv } from "@/env";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export function createNeonClient() {
	const client = neon(serverEnv.DATABASE_URL);
	const db = drizzle({ client });
	return db;
}
