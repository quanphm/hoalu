import { serverEnv } from "@/env";
import { createNeonClient } from "./neon-client";
import { createNodePostgresClient } from "./node-postgres-client";

const isUseNeon = serverEnv.DATABASE_URL.includes("neon.tech");
export const db = isUseNeon ? createNeonClient() : createNodePostgresClient();
