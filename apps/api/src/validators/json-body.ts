import { zValidator } from "@hono/zod-validator";
import type { ZodObject } from "zod";

import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";

export const jsonBodyValidator = <T extends ZodObject>(schema: T) =>
	zValidator("json", schema, (result, c) => {
		if (!result.success) {
			return c.json({ message: createIssueMsg(result.error.issues) }, HTTPStatus.codes.BAD_REQUEST);
		}
	});
