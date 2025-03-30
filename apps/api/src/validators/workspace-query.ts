import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { type } from "arktype";
import { validator as aValidator } from "hono-openapi/arktype";

const WorkspaceIdOrSlugSchema = type({
	workspaceIdOrSlug: "string > 0",
});

export const workspaceQueryValidator = aValidator("query", WorkspaceIdOrSlugSchema, (result, c) => {
	if (!result.success) {
		return c.json({ message: createIssueMsg(result.errors.issues) }, HTTPStatus.codes.BAD_REQUEST);
	}
});
