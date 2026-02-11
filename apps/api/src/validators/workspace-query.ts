import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { zValidator } from "@hono/zod-validator";
import * as z from "zod";

const WorkspaceIdOrSlugSchema = z.object({
	workspaceIdOrSlug: z.string().min(1),
});

export const workspaceQueryValidator = zValidator("query", WorkspaceIdOrSlugSchema, (result, c) => {
	if (!result.success) {
		return c.json({ message: createIssueMsg(result.error.issues) }, HTTPStatus.codes.BAD_REQUEST);
	}
});
