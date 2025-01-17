import { HTTPStatus } from "@woben/common/http-status";
import { createAuthEndpoint, getSessionFromCtx } from "better-auth/api";
import { APIError } from "better-call";
import { z } from "zod";
import { getOrgAdapter } from "../adapter";
import { workspaceMiddleware, workspaceSessionMiddleware } from "../call";
import { WORKSPACE_ERROR_CODES } from "../error-codes";
import type { WorkspaceOptions } from "../index";
import type { Member } from "../schema";

export const addMember = createAuthEndpoint(
	"/organization/add-member",
	{
		method: "POST",
		body: z.object({
			userId: z.string(),
			role: z.string() as any,
			organizationId: z.string().optional(),
		}),
		use: [workspaceMiddleware],
		metadata: {
			SERVER_ONLY: true,
		},
	},
	async (ctx) => {
		const session = ctx.body.userId
			? await getSessionFromCtx<{
					session: {
						activeOrganizationId?: string;
					};
				}>(ctx).catch((e) => null)
			: null;
		const orgId = ctx.body.organizationId || session?.session.activeOrganizationId;
		if (!orgId) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.NO_ACTIVE_WORKSPACE,
				},
			});
		}

		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);

		const user = await ctx.context.internalAdapter.findUserById(ctx.body.userId);

		if (!user) {
			throw new APIError("BAD_REQUEST", {
				message: "User not found",
			});
		}

		const alreadyMember = await adapter.findMemberByEmail({
			email: user.email,
			organizationId: orgId,
		});
		if (alreadyMember) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.USER_IS_ALREADY_A_MEMBER_OF_THIS_WORKSPACE,
			});
		}

		const createdMember = await adapter.createMember({
			workspaceId: orgId,
			userId: user.id,
			role: ctx.body.role as string,
			createdAt: new Date(),
		});

		return ctx.json(createdMember);
	},
);

export const removeMember = createAuthEndpoint(
	"/organization/remove-member",
	{
		method: "POST",
		body: z.object({
			memberIdOrEmail: z.string({
				description: "The ID or email of the member to remove",
			}),
			/**
			 * If not provided, the active organization will be used
			 */
			organizationId: z
				.number({
					description:
						"The ID of the organization to remove the member from. If not provided, the active organization will be used",
				})
				.optional(),
		}),
		use: [workspaceMiddleware, workspaceSessionMiddleware],
		metadata: {
			openapi: {
				description: "Remove a member from an organization",
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
													type: "string",
												},
												workspaceId: {
													type: "string",
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
		const organizationId = ctx.body.organizationId || session.session.activeOrganizationId;
		if (!organizationId) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.NO_ACTIVE_WORKSPACE,
				},
			});
		}
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		const member = await adapter.findMemberByOrgId({
			userId: session.user.id,
			organizationId: organizationId,
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
		const isLeaving =
			// @ts-ignore
			session.user.email === ctx.body.memberIdOrEmail || member.id === ctx.body.memberIdOrEmail;
		const isOwnerLeaving =
			isLeaving && member.role === (ctx.context.orgOptions?.creatorRole || "owner");
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
		let existing: Member | null = null;
		if (ctx.body.memberIdOrEmail.includes("@")) {
			existing = await adapter.findMemberByEmail({
				email: ctx.body.memberIdOrEmail,
				organizationId: organizationId,
			});
		} else {
			existing = await adapter.findMemberById(ctx.body.memberIdOrEmail);
		}
		if (existing?.workspaceId !== organizationId) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.MEMBER_NOT_FOUND,
			});
		}
		await adapter.deleteMember(existing.id);
		if (
			session.user.id === existing.userId &&
			session.session.activeOrganizationId === existing.workspaceId
		) {
			await adapter.setActiveOrganization(session.session.token, null);
		}
		return ctx.json({
			member: existing,
		});
	},
);

export const updateMemberRole = createAuthEndpoint(
	"/organization/update-member-role",
	{
		method: "POST",
		body: z.object({
			role: z.string() as any,
			memberId: z.string(),
			/**
			 * If not provided, the active organization will be used
			 */
			organizationId: z.number().optional(),
		}),
		use: [workspaceMiddleware, workspaceSessionMiddleware],
		metadata: {
			openapi: {
				description: "Update the role of a member in an organization",
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
													type: "string",
												},
												workspaceId: {
													type: "string",
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
		const organizationId = ctx.body.organizationId || session.session.activeOrganizationId;
		if (!organizationId) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.NO_ACTIVE_WORKSPACE,
				},
			});
		}
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		const member = await adapter.findMemberByOrgId({
			userId: session.user.id,
			organizationId: organizationId,
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

		const updatedMember = await adapter.updateMember(ctx.body.memberId, ctx.body.role as string);
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
	"/organization/get-active-member",
	{
		method: "GET",
		use: [workspaceMiddleware, workspaceSessionMiddleware],
		metadata: {
			openapi: {
				description: "Get the active member in the organization",
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
											type: "string",
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
		const organizationId = session.session.activeOrganizationId;
		if (!organizationId) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.NO_ACTIVE_WORKSPACE,
				},
			});
		}
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		const member = await adapter.findMemberByOrgId({
			userId: session.user.id,
			organizationId: organizationId,
		});
		if (!member) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.MEMBER_NOT_FOUND,
				},
			});
		}
		return ctx.json(member);
	},
);
