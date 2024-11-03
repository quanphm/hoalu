import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	out: "./migrations",
	schema: "./app/lib/database/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
