import { arktypeValidator } from "@hono/arktype-validator";
import { type } from "arktype";

import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";

const WorkspaceIdOrSlugSchema = type({
	workspaceIdOrSlug: "string > 0",
});

export const workspaceQueryValidator = arktypeValidator(
	"query",
	WorkspaceIdOrSlugSchema,
	(result, c) => {
		if (!result.success) {
			return c.json(
				{ message: createIssueMsg(result.errors.issues) },
				HTTPStatus.codes.BAD_REQUEST,
			);
		}
	},
);
