import { z } from "zod";

export const role = z.string();
export const invitationStatus = z
	.enum(["pending", "accepted", "rejected", "canceled"])
	.default("pending");

export const workspaceSchema = z.object({
	id: z.number(),
	name: z.string(),
	slug: z.string(),
	publicId: z.string(),
	logo: z.string().nullish(),
	metadata: z
		.record(z.string())
		.or(z.string().transform((v) => JSON.parse(v)))
		.nullish(),
	createdAt: z.date(),
});
const workspaceSchemaInput = workspaceSchema.omit({ id: true });
export type Workspace = z.infer<typeof workspaceSchema>;
export type WorkspaceInput = z.infer<typeof workspaceSchemaInput>;

export const memberSchema = z.object({
	workspaceId: z.number(),
	userId: z.number(),
	role,
	createdAt: z.date(),
});
export type Member = z.infer<typeof memberSchema>;

export const invitationSchema = z.object({
	id: z.string(),
	workspaceId: z.number(),
	email: z.string(),
	role,
	status: invitationStatus,
	inviterId: z.number(),
	expiresAt: z.date(),
});
const invitationSchemaInput = invitationSchema.omit({ id: true });
export type Invitation = z.infer<typeof invitationSchema>;
