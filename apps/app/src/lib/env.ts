import { type } from "arktype";

import { standardValidate } from "@hoalu/common/standard-validate";

const EnvSchema = type({
	PUBLIC_API_URL: "string.url",
	PUBLIC_APP_BASE_URL: "string.url",
	PUBLIC_APP_VERSION: "string",
});
type EnvSchema = typeof EnvSchema.infer;

function verifyEnv() {
	standardValidate(EnvSchema, import.meta.env);
}

export { verifyEnv, type EnvSchema };
