import { type } from "arktype";

import { standardValidate } from "@hoalu/common/standard-validate";

export const EnvSchema = type({
	AUTH_SECRET: "string > 0",
	AUTH_URL: "string.url",
	DB_HOST: "string > 0",
	DB_NAME: "string > 0",
	DB_USER: "string > 0",
	DB_PASSWORD: "string > 0",
	DOMAIN: "string > 0",
	NODE_ENV: "string = 'development'",
	PUBLIC_API_URL: "string.url",
	PUBLIC_APP_BASE_URL: "string.url",
	REDIS_URL: "string.url",
	RESEND_SECRET_KEY: "string > 0",
	S3_ACCESS_KEY_ID: "string > 0",
	S3_SECRET_KEY: "string > 0",
	S3_BUCKET: "string > 0",
	S3_ENDPOINT: "string > 0",
	SYNC_SECRET: "string > 0",
	SYNC_URL: "string.url",
});

export type EnvSchema = typeof EnvSchema.infer;

export function verifyEnv() {
	standardValidate(EnvSchema, {
		// ArkType will throw error if NOT use spread operator here.
		...process.env,
	});
}
