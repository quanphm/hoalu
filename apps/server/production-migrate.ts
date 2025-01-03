/**
 * Run migrations on self-hosting server.
 *
 * @see `deployments/migration.Dockerfile`
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const DATABASE_URL = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`;
const db = drizzle(DATABASE_URL);

migrate(db, {
	migrationsFolder: "./migrations/",
}).then(() => {
	console.log("Migration completed");
	process.exit(0);
});
