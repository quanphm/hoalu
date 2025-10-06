import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const client = new Pool({
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	host: process.env.PGBOUNCER_HOST,
	port: process.env.PGBOUNCER_PORT,
	database: process.env.DB_NAME,
	max: 20,
});

export const db = drizzle({ client, schema });
export { schema };
