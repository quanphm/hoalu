import * as z from "zod";

import { standardValidate } from "@hoalu/common/standard-validate";

export const EnvSchema = z.object({
	AUTH_SECRET: z.string().min(1),
	AUTH_URL: z.url(),
	DB_HOST: z.string().min(1),
	DB_NAME: z.string().min(1),
	DB_USER: z.string().min(1),
	DB_PASSWORD: z.string().min(1),
	DOMAIN: z.string().min(1),
	NODE_ENV: z.string().default("development"),
	PUBLIC_API_URL: z.url(),
	PUBLIC_APP_BASE_URL: z.url(),
	REDIS_URL: z.url(),
	RESEND_SECRET_KEY: z.string().min(1),
	S3_ACCESS_KEY_ID: z.string().min(1),
	S3_SECRET_KEY: z.string().min(1),
	S3_BUCKET: z.string().min(1),
	S3_ENDPOINT: z.string().min(1),
	SYNC_SECRET: z.string().min(1),
	SYNC_URL: z.url(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;

export function verifyEnv() {
	standardValidate(EnvSchema, process.env);
}
