import { serverEnv } from "@/env";
import { createNeonClient } from "./neon-client";
import { createNodePostgresClient } from "./node-postgres-client";

export const db = serverEnv.DATABASE_URL.includes("neon.tech")
	? createNeonClient()
	: createNodePostgresClient();
