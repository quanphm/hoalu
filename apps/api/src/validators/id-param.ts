import { zValidatorWrapper } from "#api/validators/validator-wrapper.ts";
import * as z from "zod";

const IdSchema = z.object({
	id: z.uuidv7(),
});

export const idParamValidator = zValidatorWrapper("param", IdSchema);
