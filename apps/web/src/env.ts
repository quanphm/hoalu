import "dotenv/config";
import { validateEnv } from "@woben/common/validate-env";
import * as v from "valibot";

const EnvSchema = v.object({
	API_URL: v.pipe(v.string(), v.url()),
});

export const env = validateEnv(EnvSchema, {
	API_URL: process.env.API_URL,
});
