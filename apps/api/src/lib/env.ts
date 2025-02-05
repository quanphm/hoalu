import { validateEnv } from "@hoalu/common/validate-env";
import * as v from "valibot";

export const ServerEnvSchema = v.object({
	AUTH_SECRET: v.pipe(v.string(), v.nonEmpty()),
	AUTH_URL: v.pipe(v.string(), v.url()),
	DB_HOST: v.pipe(v.string(), v.nonEmpty()),
	DB_NAME: v.pipe(v.string(), v.nonEmpty()),
	DB_USER: v.pipe(v.string(), v.nonEmpty()),
	DB_PASSWORD: v.pipe(v.string(), v.nonEmpty()),
	DOMAIN: v.pipe(v.string(), v.nonEmpty()),
	PUBLIC_API_URL: v.pipe(v.string(), v.url()),
	PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
	RESEND_SECRET_KEY: v.pipe(v.string(), v.nonEmpty()),
	S3_ACCESS_KEY_ID: v.pipe(v.string(), v.nonEmpty()),
	S3_SECRET_KEY: v.pipe(v.string(), v.nonEmpty()),
	S3_BUCKET: v.pipe(v.string(), v.nonEmpty()),
	S3_ENDPOINT: v.pipe(v.string(), v.nonEmpty()),
	SYNC_URL: v.pipe(v.string(), v.url()),
	NODE_ENV: v.optional(v.string(), "development"),
});

export function verifyEnv() {
	const result = validateEnv(ServerEnvSchema, process.env);
	const total = Object.keys(result).length;
	console.info(`Environment variables parsed successfully (${total} variables)`);
}
