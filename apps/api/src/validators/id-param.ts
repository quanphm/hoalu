import * as z from "zod";

import { zValidatorWrapper } from "#api/validators/validator-wrapper.ts";

const IdSchema = z.object({
	id: z.uuidv7(),
});

export const idParamValidator = zValidatorWrapper("param", IdSchema);
