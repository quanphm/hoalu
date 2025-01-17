import { type ZodLiteral, z } from "zod";
import type { WorkspaceOptions } from "./index";

export const role = z.string();
export const invitationStatus = z
	.enum(["pending", "accepted", "rejected", "canceled"])
	.default("pending");

export const workspaceSchema = z.object({
	id: z.bigint().optional(),
	name: z.string(),
	slug: z.string(),
	logo: z.string().nullish(),
	metadata: z
		.record(z.string())
		.or(z.string().transform((v) => JSON.parse(v)))
		.nullish(),
	createdAt: z.date(),
});

export const memberSchema = z.object({
	id: z.bigint().optional(),
	organizationId: z.bigint(),
	userId: z.string(),
	role,
	createdAt: z.date(),
});

export const invitationSchema = z.object({
	id: z.bigint().optional(),
	organizationId: z.bigint(),
	email: z.string(),
	role,
	status: invitationStatus,
	/**
	 * The id of the user who invited the user.
	 */
	inviterId: z.string(),
	expiresAt: z.date(),
});

export type Workspace = z.infer<typeof workspaceSchema>;
export type WorkspaceInput = z.input<typeof workspaceSchema>;
export type Member = z.infer<typeof memberSchema>;
export type MemberInput = z.input<typeof memberSchema>;
export type Invitation = z.infer<typeof invitationSchema>;
export type InvitationInput = z.input<typeof invitationSchema>;

export type InferRolesFromOption<O extends WorkspaceOptions | undefined> = ZodLiteral<
	O extends { roles: any } ? keyof O["roles"] : "admin" | "member" | "owner"
>;
