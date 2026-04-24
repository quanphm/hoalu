import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";

import type { ZodObject } from "zod";

export const jsonBodyValidator = <T extends ZodObject>(schema: T) =>
	zValidator("json", schema, (result) => {
		if (!result.success) {
			throw new HTTPException(HTTPStatus.codes.BAD_REQUEST, {
				message: createIssueMsg(result.error.issues),
			});
		}
	});
