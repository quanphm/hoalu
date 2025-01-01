/**
 * Run migrations on self-hosting server.
 *
 * @see `deployment/migration.Dockerfile`
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const db = drizzle(process.env.DATABASE_URL!);

migrate(db, {
	migrationsFolder: "./drizzle/",
}).then(() => {
	console.log("Migration completed");
	process.exit(0);
});
