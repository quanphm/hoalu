import * as v from "valibot";

export const WorkspaceFormSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty()),
	slug: v.pipe(v.string(), v.nonEmpty()),
});

export type WorkspaceInputSchema = v.InferInput<typeof WorkspaceFormSchema>;
