import * as z from "zod";

import { zValidatorWrapper } from "#api/validators/validator-wrapper.ts";

const WorkspaceIdOrSlugSchema = z.object({
	workspaceIdOrSlug: z.string().min(1),
});

export const workspaceQueryValidator = zValidatorWrapper("query", WorkspaceIdOrSlugSchema);
