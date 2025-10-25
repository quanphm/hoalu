import * as z from "zod";

export const role = z.string();
export const invitationStatus = z
	.enum(["pending", "accepted", "rejected", "canceled"])
	.default("pending");

export const workspaceSchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	publicId: z.string(),
	logo: z.string().nullish(),
	metadata: z
		.record(z.string(), z.any())
		.nullish()
		.transform((v) => v ?? {}),
	createdAt: z.date(),
});
export type Workspace = z.infer<typeof workspaceSchema>;
export type WorkspaceInput = Omit<z.infer<typeof workspaceSchema>, "id">;

export const memberSchema = z.object({
	id: z.string(),
	workspaceId: z.string(),
	userId: z.string(),
	role: z.literal(["owner", "admin", "member"]),
	createdAt: z.date(),
});
export type Member = z.infer<typeof memberSchema>;
export type MemberInput = Omit<z.infer<typeof memberSchema>, "id">;

export const invitationSchema = z.object({
	id: z.string(),
	workspaceId: z.string(),
	email: z.string(),
	role: z.literal(["owner", "admin", "member"]),
	status: invitationStatus,
	inviterId: z.string(),
	expiresAt: z.date(),
});
export type Invitation = z.infer<typeof invitationSchema>;
export type InvitationInput = Omit<z.infer<typeof invitationSchema>, "id">;
