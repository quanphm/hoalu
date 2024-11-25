import { validateEnv } from "@/utils/validate-env";
import * as v from "valibot";

const ServerSchema = v.object({
	DATABASE_URL: v.pipe(v.string(), v.minLength(1), v.url()),
});

export const serverEnv = validateEnv(ServerSchema, {
	DATABASE_URL: process.env.DATABASE_URL,
});
