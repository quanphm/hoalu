import "dotenv/config";
import { validateEnv } from "@woben/common/validate-env";
import * as v from "valibot";

const EnvSchema = v.object({
	DB_HOST: v.pipe(v.string(), v.nonEmpty()),
	DB_NAME: v.pipe(v.string(), v.nonEmpty()),
	DB_USER: v.pipe(v.string(), v.nonEmpty()),
	DB_PASSWORD: v.pipe(v.string(), v.nonEmpty()),
});

export const env = validateEnv(EnvSchema, {
	DB_HOST: process.env.DB_HOST,
	DB_NAME: process.env.DB_NAME,
	DB_USER: process.env.DB_USER,
	DB_PASSWORD: process.env.DB_PASSWORD,
});
