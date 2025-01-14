import { validateEnv } from "@woben/common/validate-env";
import * as v from "valibot";

const PublicEnvSchema = v.object({
	PUBLIC_API_URL: v.pipe(v.string(), v.url()),
	PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
});

export function verifyEnv() {
	validateEnv(PublicEnvSchema, import.meta.env);
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
