/**
 * Run migrations on self-hosting server.
 *
 * @see `deployment/migration.Dockerfile`
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

console.log(process.env.DATABASE_URL);
const db = drizzle(process.env.DATABASE_URL!);

await migrate(db, {
	migrationsFolder: "./drizzle/",
}).then(() => {
	console.log("Migration completed");
	process.exit(0);
});
