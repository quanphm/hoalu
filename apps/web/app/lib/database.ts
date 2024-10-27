import { env } from "@/env";
import { TssdDatabase } from "@tssd/database";
import pg from "pg";

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
export const db = new TssdDatabase(pool);
