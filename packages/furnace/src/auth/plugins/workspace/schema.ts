import { type ZodLiteral, z } from "zod";
import type { WorkspaceOptions } from "./index";

export const role = z.string();

export const invitationStatus = z
	.enum(["pending", "accepted", "rejected", "canceled"])
	.default("pending");

export const workspaceSchema = z.object({
	id: z.number(),
	name: z.string(),
	slug: z.string(),
	logo: z.string().nullish(),
	metadata: z
		.record(z.string())
		.or(z.string().transform((v) => JSON.parse(v)))
		.nullish(),
	createdAt: z.date(),
});
const workspaceSchemaInput = workspaceSchema.omit({ id: true });

export const memberSchema = z.object({
	id: z.number(),
	organizationId: z.number(),
	userId: z.string(),
	role,
	createdAt: z.date(),
});
const memberSchemaInput = memberSchema.omit({ id: true });

export const invitationSchema = z.object({
	id: z.number(),
	organizationId: z.number(),
	email: z.string(),
	role,
	status: invitationStatus,
	/**
	 * The id of the user who invited the user.
	 */
	inviterId: z.string(),
	expiresAt: z.date(),
});
const invitationSchemaInput = invitationSchema.omit({ id: true });

export type Workspace = z.infer<typeof workspaceSchema>;
export type WorkspaceInput = z.infer<typeof workspaceSchemaInput>;
export type Member = z.infer<typeof memberSchema>;
export type MemberInput = z.infer<typeof memberSchemaInput>;
export type Invitation = z.infer<typeof invitationSchema>;
export type InvitationInput = z.infer<typeof invitationSchemaInput>;
