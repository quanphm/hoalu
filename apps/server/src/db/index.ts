import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as authSchema from "./schema/auth";

const schema = {
	...authSchema,
};

const client = new pg.Pool({
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	port: 5432,
	database: process.env.DB_NAME,
	ssl: false,
});

export const db = drizzle({ client, schema });
