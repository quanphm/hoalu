import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import type { Type } from "arktype";
import { validator as aValidator } from "hono-openapi/arktype";

export const jsonBodyValidator = <T extends Type>(schema: T) =>
	aValidator("json", schema, (result, c) => {
		if (!result.success) {
			return c.json(
				{ message: createIssueMsg(result.errors.issues) },
				HTTPStatus.codes.BAD_REQUEST,
			);
		}
	});
