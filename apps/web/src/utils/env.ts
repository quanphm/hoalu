import { validateEnv } from "@woben/common/validate-env";
import * as v from "valibot";

const PublicEnvSchema = v.object({
	PUBLIC_API_URL: v.pipe(v.string(), v.url()),
});

export function verifyEnv() {
	const result = validateEnv(PublicEnvSchema, import.meta.env);
	const total = Object.keys(result).length;
	console.info(`Environment variables parsed successfully (${total} variables)`);
}

interface ViteBuiltInEnv {
	MODE: "development" | "production";
	BASE_URL: string;
	SSR: boolean;
	DEV: boolean;
	PROD: boolean;
}

declare global {
	interface ImportMetaEnv extends v.InferInput<typeof PublicEnvSchema>, ViteBuiltInEnv {}
	interface ImportMeta {
		readonly env: ImportMetaEnv;
	}
}
