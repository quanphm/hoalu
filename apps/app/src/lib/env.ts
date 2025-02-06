import { standardValidate } from "@hoalu/common/standard-validate";
import { type } from "arktype";

const envSchema = type({
	PUBLIC_API_URL: "string.url",
	PUBLIC_APP_BASE_URL: "string.url",
});

function verifyEnv() {
	standardValidate(envSchema, import.meta.env);
}

interface ViteBuiltInEnv {
	MODE: "development" | "production";
	BASE_URL: string;
	SSR: boolean;
	DEV: boolean;
	PROD: boolean;
}
type EnvSchema = typeof envSchema.infer;

declare global {
	interface ImportMetaEnv extends EnvSchema, ViteBuiltInEnv {}
	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}

export { verifyEnv };
