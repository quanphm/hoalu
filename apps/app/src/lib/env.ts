import { standardValidate } from "@hoalu/common/standard-validate";
import * as z from "zod";

const EnvSchema = z.object({
	PUBLIC_API_URL: z.url(),
	PUBLIC_APP_BASE_URL: z.url(),
	PUBLIC_APP_VERSION: z.string(),
});
type EnvSchema = z.infer<typeof EnvSchema>;

function verifyEnv() {
	standardValidate(EnvSchema, import.meta.env);
}

export { verifyEnv, type EnvSchema };
