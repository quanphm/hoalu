import { HTTPStatus } from "@hoalu/common/http-status";
import { createStandardIssues } from "@hoalu/common/standard-validate";
import { type } from "arktype";
import { validator as aValidator } from "hono-openapi/arktype";

const workspaceIdOrSlugSchema = type({
	workspaceIdOrSlug: "string",
});

export const workspaceQueryValidator = aValidator("query", workspaceIdOrSlugSchema, (result, c) => {
	if (!result.success) {
		return c.json(
			{ message: createStandardIssues(result.errors.issues)[0] },
			HTTPStatus.codes.BAD_REQUEST,
		);
	}
});
