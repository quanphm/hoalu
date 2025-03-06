import { standardValidate } from "@hoalu/common/standard-validate";
import { type } from "arktype";

const envSchema = type({
	PUBLIC_API_URL: "string.url",
	PUBLIC_APP_BASE_URL: "string.url",
	PUBLIC_APP_VERSION: "string",
});
type EnvSchema = typeof envSchema.infer;

function verifyEnv() {
	standardValidate(envSchema, import.meta.env);
}

export { verifyEnv, type EnvSchema };
