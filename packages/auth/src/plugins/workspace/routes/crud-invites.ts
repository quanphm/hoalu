import { HTTPStatus } from "@hoalu/common/http-status";
import { createAuthEndpoint } from "better-auth/api";
import { APIError } from "better-call";
import { z } from "zod";
import { getOrgAdapter } from "../adapter";
import { workspaceMiddleware, workspaceSessionMiddleware } from "../call";
import { WORKSPACE_ERROR_CODES } from "../error-codes";
import type { WorkspaceOptions } from "../index";

export const createInvitation = createAuthEndpoint(
	"/workspace/invite-member",
	{
		method: "POST",
		use: [workspaceMiddleware, workspaceSessionMiddleware],
		body: z.object({
			email: z.string({
				description: "The email address of the user to invite",
			}),
			role: z.string({
				description: "The role to assign to the user",
			}),
			idOrSlug: z.string({
				description: "The workspace public_id or slug to invite the user to",
			}),
			resend: z
				.boolean({
					description: "Resend the invitation email, if the user is already invited",
				})
				.optional(),
		}),
		metadata: {
			openapi: {
				description: "Invite a user to an workspace",
				responses: {
					[HTTPStatus.codes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										id: {
											type: "string",
										},
										email: {
											type: "string",
										},
										role: {
											type: "string",
										},
										workspaceId: {
											type: "string",
										},
										inviterId: {
											type: "string",
										},
										status: {
											type: "string",
										},
										expiresAt: {
											type: "string",
										},
									},
									required: [
										"id",
										"email",
										"role",
										"workspaceId",
										"inviterId",
										"status",
										"expiresAt",
									],
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		if (!ctx.context.orgOptions.sendInvitationEmail) {
			ctx.context.logger.warn(
				"Invitation email is not enabled. Pass `sendInvitationEmail` to the plugin options to enable it.",
			);
			throw new APIError("BAD_REQUEST", {
				message: "Invitation email is not enabled",
			});
		}

		const session = ctx.context.session;
		const idOrSlug = ctx.body.idOrSlug;
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);

		const workspace = await adapter.findWorkspace(idOrSlug);
		if (!workspace) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
			});
		}

		const member = await adapter.findMemberByWorkspaceId({
			userId: session.user.id,
			workspaceId: workspace.id,
		});
		if (!member) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.MEMBER_NOT_FOUND,
			});
		}

		const role = ctx.context.roles[member.role];
		if (!role) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.ROLE_NOT_FOUND,
			});
		}

		const canInvite = role.authorize({
			invitation: ["create"],
		});
		if (canInvite.error) {
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_INVITE_USERS_TO_THIS_WORKSPACE,
			});
		}

		const creatorRole = ctx.context.orgOptions.creatorRole || "owner";
		if (member.role !== creatorRole && ctx.body.role === creatorRole) {
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_INVITE_USER_WITH_THIS_ROLE,
			});
		}

		const alreadyMember = await adapter.findMemberByEmail({
			email: ctx.body.email,
			workspaceId: workspace.id,
		});
		if (alreadyMember) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.USER_IS_ALREADY_A_MEMBER_OF_THIS_WORKSPACE,
			});
		}

		const alreadyInvited = await adapter.findPendingInvitation({
			email: ctx.body.email,
			workspaceId: workspace.id,
		});
		if (alreadyInvited.length && !ctx.body.resend) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.USER_IS_ALREADY_INVITED_TO_THIS_WORKSPACE,
			});
		}

		const invitation = await adapter.createInvitation({
			invitation: {
				role: ctx.body.role as string,
				email: ctx.body.email,
				workspaceId: workspace.id,
			},
			user: session.user,
		});

		await ctx.context.orgOptions.sendInvitationEmail(
			{
				id: invitation.id,
				role: invitation.role as string,
				email: invitation.email,
				workspace: workspace,
				inviter: {
					...member,
					user: session.user,
				},
			},
			ctx.request,
		);

		return ctx.json(invitation);
	},
);

export const acceptInvitation = createAuthEndpoint(
	"/workspace/accept-invitation",
	{
		method: "POST",
		body: z.object({
			invitationId: z.string({
				description: "The ID of the invitation to accept",
			}),
		}),
		use: [workspaceMiddleware, workspaceSessionMiddleware],
		metadata: {
			openapi: {
				description: "Accept an invitation to an workspace",
				responses: {
					[HTTPStatus.codes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										invitation: {
											type: "object",
										},
										member: {
											type: "object",
										},
									},
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		const session = ctx.context.session;
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);

		const invitation = await adapter.findInvitationById(ctx.body.invitationId);
		if (!invitation || invitation.expiresAt < new Date() || invitation.status !== "pending") {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.INVITATION_NOT_FOUND,
			});
		}
		if (invitation.email !== session.user.email) {
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION,
			});
		}

		const acceptedId = await adapter.updateInvitation({
			invitationId: ctx.body.invitationId,
			status: "accepted",
		});
		const member = await adapter.createMember({
			workspaceId: invitation.workspaceId,
			userId: session.user.id,
			role: invitation.role,
			createdAt: new Date(),
		});

		if (!acceptedId) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.INVITATION_NOT_FOUND,
				},
			});
		}

		const workspace = await adapter.findWorkspace(invitation.workspaceId);
		if (!workspace) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
				},
			});
		}

		return ctx.json({
			invitation: acceptedId,
			workspace,
			member,
		});
	},
);

export const rejectInvitation = createAuthEndpoint(
	"/workspace/reject-invitation",
	{
		method: "POST",
		body: z.object({
			invitationId: z.string({
				description: "The ID of the invitation to reject",
			}),
		}),
		use: [workspaceMiddleware, workspaceSessionMiddleware],
		metadata: {
			openapi: {
				description: "Reject an invitation to an workspace",
				responses: {
					[HTTPStatus.codes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										invitation: {
											type: "object",
										},
										member: {
											type: "null",
										},
									},
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		const session = ctx.context.session;
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		const invitation = await adapter.findInvitationById(ctx.body.invitationId);
		if (!invitation || invitation.expiresAt < new Date() || invitation.status !== "pending") {
			throw new APIError("BAD_REQUEST", {
				message: "Invitation not found!",
			});
		}
		if (invitation.email !== session.user.email) {
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION,
			});
		}
		const rejectedI = await adapter.updateInvitation({
			invitationId: ctx.body.invitationId,
			status: "rejected",
		});
		return ctx.json({
			invitation: rejectedI,
			member: null,
		});
	},
);

export const cancelInvitation = createAuthEndpoint(
	"/workspace/cancel-invitation",
	{
		method: "POST",
		body: z.object({
			invitationId: z.string({
				description: "The ID of the invitation to cancel",
			}),
		}),
		use: [workspaceMiddleware, workspaceSessionMiddleware],
		openapi: {
			description: "Cancel an invitation to an workspace",
			responses: {
				[HTTPStatus.codes.OK]: {
					description: "Success",
					content: {
						"application/json": {
							schema: {
								type: "object",
								properties: {
									invitation: {
										type: "object",
									},
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		const session = ctx.context.session;
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		const invitation = await adapter.findInvitationById(ctx.body.invitationId);
		if (!invitation) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.INVITATION_NOT_FOUND,
			});
		}
		const member = await adapter.findMemberByWorkspaceId({
			userId: session.user.id,
			workspaceId: invitation.workspaceId,
		});
		if (!member) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.MEMBER_NOT_FOUND,
			});
		}
		const canCancel = ctx.context.roles[member.role].authorize({
			invitation: ["cancel"],
		});
		if (canCancel.error) {
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_INVITATION,
			});
		}
		const canceledI = await adapter.updateInvitation({
			invitationId: ctx.body.invitationId,
			status: "canceled",
		});
		return ctx.json(canceledI);
	},
);

export const getInvitation = createAuthEndpoint(
	"/workspace/get-invitation",
	{
		method: "GET",
		use: [workspaceMiddleware],
		requireHeaders: true,
		query: z.object({
			id: z.string({
				description: "The ID of the invitation to get",
			}),
		}),
		metadata: {
			openapi: {
				description: "Get an invitation by ID",
				responses: {
					[HTTPStatus.codes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										id: {
											type: "string",
										},
										email: {
											type: "string",
										},
										role: {
											type: "string",
										},
										workspaceId: {
											type: "number",
										},
										inviterId: {
											type: "string",
										},
										status: {
											type: "string",
										},
										expiresAt: {
											type: "string",
										},
										workspaceName: {
											type: "string",
										},
										workspaceSlug: {
											type: "string",
										},
										inviterEmail: {
											type: "string",
										},
									},
									required: [
										"id",
										"email",
										"role",
										"workspaceId",
										"inviterId",
										"status",
										"expiresAt",
										"workspaceName",
										"workspaceSlug",
										"inviterEmail",
									],
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		const invitation = await adapter.findInvitationById(ctx.query.id);
		if (!invitation || invitation.status !== "pending" || invitation.expiresAt < new Date()) {
			throw new APIError("BAD_REQUEST", {
				message: "Invitation not found!",
			});
		}
		const workspace = await adapter.findWorkspace(invitation.workspaceId);
		if (!workspace) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
			});
		}
		const member = await adapter.findMemberByWorkspaceId({
			userId: invitation.inviterId,
			workspaceId: invitation.workspaceId,
		});
		if (!member) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_WORKSPACE,
			});
		}

		return ctx.json({
			id: invitation.id,
			recipient: invitation.email,
			status: invitation.status,
			inviterEmail: member.user.email,
			inviterName: member.user.name,
			workspaceName: workspace.name,
			workspaceLogo: workspace.logo,
			expiresAt: invitation.expiresAt,
		});
	},
);
