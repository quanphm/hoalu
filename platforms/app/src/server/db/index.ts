import { serverEnv } from "@/env";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const client = new pg.Pool({
	host: serverEnv.DB_HOST,
	port: 5432,
	user: serverEnv.DB_USER,
	password: serverEnv.DB_PASSWORD,
	database: serverEnv.DB_NAME,
	ssl: false,
});

export const db = drizzle({ client });
