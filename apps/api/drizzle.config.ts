import { defineConfig } from "drizzle-kit";
import * as z from "zod";

const env = z
	.object({
		DB_HOST: z.string().min(1),
		DB_USER: z.string().min(1),
		DB_PASSWORD: z.string().min(1),
		DB_NAME: z.string().min(1),
	})
	.parse(process.env);

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	out: "./migrations",
	dbCredentials: {
		host: env.DB_HOST,
		port: 5432,
		user: env.DB_USER,
		password: env.DB_PASSWORD,
		database: env.DB_NAME,
		ssl: false,
	},
});
