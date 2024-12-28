import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./migrations",
	schema: "./src/server/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		host: process.env.DB_HOST!,
		port: 5432,
		user: process.env.DB_USER!,
		password: process.env.DB_PASSWORD!,
		database: process.env.DB_NAME!,
		ssl: false,
	},
});
