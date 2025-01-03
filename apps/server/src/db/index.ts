import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../env";

const client = new pg.Pool({
	user: env.DB_USER,
	password: env.DB_PASSWORD,
	host: env.DB_HOST,
	port: 5432,
	database: env.DB_NAME,
	ssl: false,
});

export const db = drizzle({ client });
