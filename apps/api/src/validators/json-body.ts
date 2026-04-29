import { zValidatorWrapper } from "#api/validators/validator-wrapper.ts";

import type { ZodObject } from "zod";

export const jsonBodyValidator = <T extends ZodObject>(schema: T) =>
	zValidatorWrapper("json", schema);
