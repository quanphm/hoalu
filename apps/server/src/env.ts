import { validateEnv } from "@woben/common/validate-env";
import * as v from "valibot";

const ServerEnvSchema = v.object({
	DB_HOST: v.pipe(v.string(), v.nonEmpty()),
	DB_NAME: v.pipe(v.string(), v.nonEmpty()),
	DB_USER: v.pipe(v.string(), v.nonEmpty()),
	DB_PASSWORD: v.pipe(v.string(), v.nonEmpty()),
});

export function verifyEnv() {
	const result = validateEnv(ServerEnvSchema, process.env);
	const total = Object.keys(result).length;
	console.info(`Environment variables parsed successfully (${total} variables)`);
}

declare global {
	namespace NodeJS {
		interface ProcessEnv extends v.InferInput<typeof ServerEnvSchema> {}
	}
}
