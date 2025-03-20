import { TIME_IN_SECONDS } from "@hoalu/common/time";
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
	idle_timeout: TIME_IN_SECONDS.MINUTE,
	max_lifetime: TIME_IN_SECONDS.HOUR,
});

export const db = drizzle({ client, schema });
export { schema };
