import { HTTPStatus } from "@hoalu/common/http-status";
import { createAuthEndpoint } from "better-auth/api";
import { APIError } from "better-call";
import { z } from "zod";
import type { User } from "../../../utils/types";
import { getAdapter } from "../adapter";
import { workspaceMiddleware, workspaceSessionMiddleware } from "../call";
import { WORKSPACE_ERROR_CODES } from "../error-codes";
import type { WorkspaceOptions } from "../index";

export const addMember = createAuthEndpoint(
	"/workspace/add-member",
	{
		method: "POST",
		body: z.object({
			userId: z.string(),
			role: z.string(),
			workspaceId: z.string(),
		}),
		use: [workspaceMiddleware],
		metadata: {
			SERVER_ONLY: true,
		},
	},
	async (ctx) => {
		const workspaceId = ctx.body.workspaceId;
		if (!workspaceId) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
			});
		}

		const adapter = getAdapter(ctx.context, ctx.context.orgOptions);
		const user = await ctx.context.internalAdapter.findUserById(ctx.body.userId as any);
		if (!user) {
			throw new APIError("BAD_REQUEST", {
				message: "User not found",
			});
		}

		const alreadyMember = await adapter.findMemberByEmail({
			email: user.email,
			workspaceId,
		});
		if (alreadyMember) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.USER_IS_ALREADY_A_MEMBER_OF_THIS_WORKSPACE,
			});
		}

		const membershipLimit = ctx.context.orgOptions?.membershipLimit || 100;
		const members = await adapter.listMembers({ workspaceId });
		if (members.length >= membershipLimit) {
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.ORGANIZATION_MEMBERSHIP_LIMIT_REACHED,
			});
		}

		const createdMember = await adapter.createMember({
			workspaceId,
			userId: user.id,
			role: ctx.body.role as string,
			createdAt: new Date(),
		});

		return ctx.json(createdMember);
	},
);

export const removeMember = createAuthEndpoint(
	"/workspace/remove-member",
	{
		method: "POST",
		body: z.object({
			userId: z.string({
				description: "The user ID the member to remove",
			}),
			idOrSlug: z.string({
				description: "The workspace public_id or slug to remove the member from.",
			}),
		}),
		use: [workspaceMiddleware, workspaceSessionMiddleware],
		metadata: {
			openapi: {
				description: "Remove a member from an workspace",
				responses: {
					[HTTPStatus.codes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										member: {
											type: "object",
											properties: {
												id: {
													type: "number",
												},
												userId: {
													type: "number",
												},
												workspaceId: {
													type: "number",
												},
												role: {
													type: "string",
												},
											},
											required: ["id", "userId", "workspaceId", "role"],
										},
									},
									required: ["member"],
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
		const idOrSlug = ctx.body.idOrSlug;
		if (!idOrSlug) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
			});
		}
		const adapter = getAdapter(ctx.context, ctx.context.orgOptions);
		const workspace = await adapter.findWorkspace(idOrSlug);
		if (!workspace) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
			});
		}
		const currentMemberBySession = await adapter.findMemberByWorkspaceId({
			userId: session.user.id,
			workspaceId: workspace.id,
		});
		if (!currentMemberBySession) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.MEMBER_NOT_FOUND,
			});
		}
		const role = ctx.context.roles[currentMemberBySession.role];
		if (!role) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.ROLE_NOT_FOUND,
			});
		}
		const isLeaving = currentMemberBySession.userId === ctx.body.userId;

		const isOwnerLeaving =
			isLeaving && currentMemberBySession.role === (ctx.context.orgOptions?.creatorRole || "owner");
		if (isOwnerLeaving) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.YOU_CANNOT_LEAVE_THE_WORKSPACE_AS_THE_ONLY_OWNER,
			});
		}

		const canDeleteMember =
			isLeaving ||
			role.authorize({
				member: ["delete"],
			}).success;
		if (!canDeleteMember) {
			throw new APIError("UNAUTHORIZED", {
				message: WORKSPACE_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_MEMBER,
			});
		}

		const existing = await adapter.findMemberByWorkspaceId({
			userId: ctx.body.userId,
			workspaceId: workspace.id,
		});
		if (!existing) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.MEMBER_NOT_FOUND,
			});
		}

		await adapter.deleteMember(existing.userId, existing.workspaceId);

		return ctx.json({
			member: existing,
		});
	},
);

export const updateMemberRole = createAuthEndpoint(
	"/workspace/update-member-role",
	{
		method: "POST",
		body: z.object({
			role: z.string(),
			userId: z.string(),
			workspaceId: z.string(),
		}),
		use: [workspaceMiddleware, workspaceSessionMiddleware],
		metadata: {
			openapi: {
				description: "Update the role of a member in an workspace",
				responses: {
					[HTTPStatus.codes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										member: {
											type: "object",
											properties: {
												id: {
													type: "string",
												},
												userId: {
													type: "number",
												},
												workspaceId: {
													type: "number",
												},
												role: {
													type: "string",
												},
											},
											required: ["id", "userId", "workspaceId", "role"],
										},
									},
									required: ["member"],
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
		const workspaceId = ctx.body.workspaceId;
		if (!workspaceId) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.NO_ACTIVE_WORKSPACE,
				},
			});
		}
		const adapter = getAdapter(ctx.context, ctx.context.orgOptions);
		const member = await adapter.findMemberByWorkspaceId({
			userId: session.user.id,
			workspaceId,
		});
		if (!member) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.MEMBER_NOT_FOUND,
				},
			});
		}
		const role = ctx.context.roles[member.role];
		if (!role) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.ROLE_NOT_FOUND,
				},
			});
		}
		/**
		 * If the member is not an owner, they cannot update the role of another member
		 * as an owner.
		 */
		const canUpdateMember =
			role.authorize({
				member: ["update"],
			}).error ||
			(ctx.body.role === "owner" && member.role !== "owner");
		if (canUpdateMember) {
			return ctx.json(null, {
				body: {
					message: "You are not allowed to update this member",
				},
				status: HTTPStatus.codes.FORBIDDEN,
			});
		}

		const updatedMember = await adapter.updateMember(ctx.body.userId, workspaceId, ctx.body.role);
		if (!updatedMember) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.MEMBER_NOT_FOUND,
				},
			});
		}
		return ctx.json(updatedMember);
	},
);

export const getActiveMember = createAuthEndpoint(
	"/workspace/get-active-member",
	{
		method: "GET",
		query: z.object({
			idOrSlug: z.string({
				description: "The workspace public_id or slug to get",
			}),
		}),
		use: [workspaceMiddleware, workspaceSessionMiddleware],
		metadata: {
			openapi: {
				description: "Get the active member in the workspace",
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
										userId: {
											type: "string",
										},
										workspaceId: {
											type: "number",
										},
										role: {
											type: "string",
										},
									},
									required: ["id", "userId", "workspaceId", "role"],
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
		const idOrSlug = ctx.query?.idOrSlug;
		if (!idOrSlug) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.NO_ACTIVE_WORKSPACE,
			});
		}
		const adapter = getAdapter(ctx.context, ctx.context.orgOptions);
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

		return ctx.json(member);
	},
);
