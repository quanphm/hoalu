import { HTTPStatus } from "@hoalu/common/http-status";
import { createIssueMsg } from "@hoalu/common/standard-validate";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import * as z from "zod";

const WorkspaceIdOrSlugSchema = z.object({
	workspaceIdOrSlug: z.string().min(1),
});

export const workspaceQueryValidator = zValidator("query", WorkspaceIdOrSlugSchema, (result) => {
	if (!result.success) {
		throw new HTTPException(HTTPStatus.codes.BAD_REQUEST, {
			message: createIssueMsg(result.error.issues),
		});
	}
});
