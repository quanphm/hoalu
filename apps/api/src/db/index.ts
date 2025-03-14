import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres({
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	host: process.env.DB_HOST,
	port: 5432,
	database: process.env.DB_NAME,
	max: 20,
	idle_timeout: 30,
	max_lifetime: 3600,
	connect_timeout: 10,
});

export const db = drizzle({ client, schema });
export { schema };
