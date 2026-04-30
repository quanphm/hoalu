import { zValidatorWrapper } from "#api/validators/validator-wrapper.ts";
import * as z from "zod";

const WorkspaceIdOrSlugSchema = z.object({
	workspaceIdOrSlug: z.string().min(1),
});

export const workspaceQueryValidator = zValidatorWrapper("query", WorkspaceIdOrSlugSchema);
