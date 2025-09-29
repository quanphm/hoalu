import { arktypeValidator } from "@hono/arktype-validator";
import type { Type } from "arktype";

import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";

export const jsonBodyValidator = <T extends Type>(schema: T) =>
	arktypeValidator("json", schema, (result, c) => {
		if (!result.success) {
			return c.json(
				{ message: createIssueMsg(result.errors.issues) },
				HTTPStatus.codes.BAD_REQUEST,
			);
		}
	});
