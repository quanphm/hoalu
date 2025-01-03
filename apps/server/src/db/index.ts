import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { serverEnv } from "../env";

const client = new pg.Pool({
	user: serverEnv.DB_USER,
	password: serverEnv.DB_PASSWORD,
	host: serverEnv.DB_HOST,
	port: 5432,
	database: serverEnv.DB_NAME,
	ssl: false,
});

export const db = drizzle({ client });
