import * as v from "valibot";

export const CreateWorkspaceFormSchema = v.object({
	name: v.pipe(v.string(), v.nonEmpty()),
	slug: v.pipe(v.string(), v.nonEmpty()),
});
export type CreateWorkspaceInputSchema = v.InferInput<typeof CreateWorkspaceFormSchema>;

export const InviteFormSchema = v.object({
	email: v.pipe(v.string(), v.email(), v.nonEmpty()),
});
export type InviteInputSchema = v.InferInput<typeof InviteFormSchema>;
