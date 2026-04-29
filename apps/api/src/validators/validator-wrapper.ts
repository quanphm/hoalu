import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";

import type { ValidationTargets } from "hono";

export const zValidatorWrapper = <T extends z.ZodSchema, Target extends keyof ValidationTargets>(
	target: Target,
	schema: T,
) =>
	zValidator(target, schema, (result, c) => {
		if (!result.success) {
			return c.json({ message: createIssueMsg(result.error.issues) }, HTTPStatus.codes.BAD_REQUEST);
		}
		return;
	});
