import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as authSchema from "./schema/auth";
import * as financeSchema from "./schema/finance";
import * as fxRateSchema from "./schema/fx-rate";
import * as taskSchema from "./schema/task";
import * as workspaceSchema from "./schema/workspace";

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

const schema = {
	...authSchema,
	...workspaceSchema,
	...fxRateSchema,
	...financeSchema,
	...taskSchema,
};

export const db = drizzle({ client, schema });
