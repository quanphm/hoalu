import { generateId } from "@woben/common/generate-id";
import { HTTPStatus } from "@woben/common/http-status";
import { createAuthEndpoint, getSessionFromCtx } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import {
	type AccessControl,
	type Role,
	defaultRoles,
	type defaultStatements,
} from "better-auth/plugins/access";
import { APIError } from "better-call";
import { type ZodArray, type ZodNumber, type ZodObject, type ZodOptional, z } from "zod";
import type { Session, User } from "../../../utils/types";
import { getOrgAdapter } from "../adapter";
import { workspaceMiddleware, workspaceSessionMiddleware } from "../call";
import { WORKSPACE_ERROR_CODES } from "../error-codes";

export const createWorkspace = createAuthEndpoint(
	"/workspace/create",
	{
		method: "POST",
		body: z.object({
			name: z.string({
				description: "The name of the workspace",
			}),
			slug: z.string({
				description: "The slug of the workspace",
			}),
			logo: z
				.string({
					description: "The logo of the workspace",
				})
				.optional(),
			metadata: z
				.record(z.string(), z.any(), {
					description: "The metadata of the workspace",
				})
				.optional(),
		}),
		use: [workspaceMiddleware],
		metadata: {
			openapi: {
				description: "Create an workspace",
				responses: {
					[HTTPStatus.codes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									description: "The workspace that was created",
									$ref: "#/components/schemas/Workspace",
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		const session = await getSessionFromCtx<User, Session>(ctx);
		if (!session && (ctx.request || ctx.headers)) {
			throw new APIError("UNAUTHORIZED");
		}
		const user = session?.user || null;
		if (!user) {
			throw new APIError("UNAUTHORIZED");
		}
		const options = ctx.context.orgOptions;
		const canCreateWorkspace =
			typeof options?.allowUserToCreateWorkspace === "function"
				? await options.allowUserToCreateWorkspace(user)
				: options?.allowUserToCreateWorkspace === undefined
					? true
					: options.allowUserToCreateWorkspace;

		if (!canCreateWorkspace) {
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_WORKSPACE,
			});
		}
		const adapter = getOrgAdapter(ctx.context, options);

		const userWorkspaces = await adapter.listWorkspaces(user.id);
		const hasReachedWorkspaceLimit =
			typeof options.workspaceLimit === "number"
				? userWorkspaces.length >= options.workspaceLimit
				: typeof options.workspaceLimit === "function"
					? await options.workspaceLimit(user)
					: false;

		if (hasReachedWorkspaceLimit) {
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_WORKSPACES,
			});
		}

		const existingWorkspace = await adapter.findWorkspaceBySlug(ctx.body.slug);
		if (existingWorkspace) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.WORKSPACE_ALREADY_EXISTS,
			});
		}
		const workspace = await adapter.createWorkspace({
			workspace: {
				slug: ctx.body.slug,
				name: ctx.body.name,
				publicId: generateId("workspace"),
				logo: ctx.body.logo,
				createdAt: new Date(),
				metadata: ctx.body.metadata,
			},
			user: user,
		});
		if (ctx.context.session) {
			await adapter.setActiveWorkspace(ctx.context.session.session.token, workspace.id);
		}
		return ctx.json(workspace);
	},
);

export const updateWorkspace = createAuthEndpoint(
	"/workspace/update",
	{
		method: "POST",
		body: z.object({
			data: z
				.object({
					name: z
						.string({
							description: "The name of the workspace",
						})
						.optional(),
					slug: z
						.string({
							description: "The slug of the workspace",
						})
						.optional(),
					logo: z
						.string({
							description: "The logo of the workspace",
						})
						.optional(),
					metadata: z
						.record(z.string(), z.any(), {
							description: "The metadata of the workspace",
						})
						.optional(),
				})
				.partial(),
			workspaceId: z.number().optional(),
		}),
		requireHeaders: true,
		use: [workspaceMiddleware],
		metadata: {
			openapi: {
				description: "Update an workspace",
				responses: {
					[HTTPStatus.codes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									description: "The updated workspace",
									$ref: "#/components/schemas/Workspace",
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		const session = await ctx.context.getSession(ctx);
		if (!session) {
			throw new APIError("UNAUTHORIZED", {
				message: "User not found",
			});
		}
		const workspaceId = ctx.body.workspaceId || session.session.activeWorkspaceId;
		if (!workspaceId) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
				},
			});
		}
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		const member = await adapter.findMemberByWorkspaceId({
			userId: session.user.id,
			workspaceId,
		});
		if (!member) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.USER_IS_NOT_A_MEMBER_OF_THE_WORKSPACE,
				},
			});
		}
		const role = ctx.context.roles[member.role];
		if (!role) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: "Role not found!",
				},
			});
		}
		const canUpdateOrg = role.authorize({
			organization: ["update"],
		});
		if (canUpdateOrg.error) {
			return ctx.json(null, {
				body: {
					message: WORKSPACE_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_WORKSPACE,
				},
				status: 403,
			});
		}
		const updatedOrg = await adapter.updateWorkspace(workspaceId, ctx.body.data);
		return ctx.json(updatedOrg);
	},
);

export const deleteWorkspace = createAuthEndpoint(
	"/workspace/delete",
	{
		method: "POST",
		body: z.object({
			workspaceId: z.number({
				description: "The workspace id or slug to delete",
			}),
		}),
		requireHeaders: true,
		use: [workspaceMiddleware],
		metadata: {
			openapi: {
				description: "Delete an workspace",
				responses: {
					[HTTPStatus.codes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "string",
									description: "The workspace id that was deleted",
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		const session = await ctx.context.getSession(ctx);
		if (!session) {
			return ctx.json(null, {
				status: HTTPStatus.codes.UNAUTHORIZED,
			});
		}
		const workspaceId = ctx.body.workspaceId;
		if (!workspaceId) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
				},
			});
		}
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		const member = await adapter.findMemberByWorkspaceId({
			userId: session.user.id,
			workspaceId,
		});
		if (!member) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.USER_IS_NOT_A_MEMBER_OF_THE_WORKSPACE,
				},
			});
		}
		const role = ctx.context.roles[member.role];
		if (!role) {
			return ctx.json(null, {
				status: HTTPStatus.codes.BAD_REQUEST,
				body: {
					message: "Role not found!",
				},
			});
		}
		const canDeleteOrg = role.authorize({
			organization: ["delete"],
		});
		if (canDeleteOrg.error) {
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_DELETE_THIS_WORKSPACE,
			});
		}
		if (session.session.activeWorkspaceId && workspaceId === session.session.activeWorkspaceId) {
			/**
			 * If the workspace is deleted, we set the active workspace to null
			 */
			await adapter.setActiveWorkspace(session.session.token, null);
		}
		const option = ctx.context.orgOptions.workspaceDeletion;
		if (option?.disabled) {
			throw new APIError("FORBIDDEN");
		}
		const org = await adapter.findWorkspaceById(workspaceId);
		if (!org) {
			throw new APIError("BAD_REQUEST");
		}
		if (option?.beforeDelete) {
			await option.beforeDelete({
				workspace: org,
				user: session.user,
			});
		}
		await adapter.deleteWorkspace(workspaceId);
		if (option?.afterDelete) {
			await option.afterDelete({
				workspace: org,
				user: session.user,
			});
		}
		return ctx.json(org);
	},
);

export const getFullWorkspace = createAuthEndpoint(
	"/workspace/get-full-workspace",
	{
		method: "GET",
		query: z.optional(
			z.object({
				workspaceId: z
					.number({
						description: "The workspace id to get",
					})
					.optional(),
				workspaceSlug: z
					.string({
						description: "The workspace slug to get",
					})
					.optional(),
			}),
		),
		requireHeaders: true,
		use: [workspaceMiddleware, workspaceSessionMiddleware],
		metadata: {
			openapi: {
				description: "Get the full workspace",
				responses: {
					[HTTPStatus.codes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									description: "The workspace",
									$ref: "#/components/schemas/Workspace",
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
		const workspaceId = ctx.query?.workspaceId || session.session.activeWorkspaceId;
		const workspaceSlug = ctx.query?.workspaceSlug;

		if (!workspaceId && !workspaceSlug) {
			return ctx.json(null, {
				status: 200,
			});
		}

		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		let workspace: Awaited<ReturnType<typeof adapter.findFullWorkspace>> = null;

		if (workspaceId) {
			workspace = await adapter.findFullWorkspace({
				workspaceId,
			});
		} else if (workspaceSlug) {
			workspace = await adapter.findFullWorkspace({
				workspaceId: workspaceSlug,
				isSlug: true,
			});
		}

		if (!workspace) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
			});
		}

		const isMember = workspace.members.find((member) => member.userId === session.user.id);
		if (!isMember) {
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.USER_IS_NOT_A_MEMBER_OF_THE_WORKSPACE,
			});
		}

		return ctx.json(workspace);
	},
);

export const setActiveWorkspace = createAuthEndpoint(
	"/workspace/set-active",
	{
		method: "POST",
		body: z.object({
			workspaceId: z
				.number({
					description:
						"The workspace id to set as active. It can be null to unset the active workspace",
				})
				.nullable()
				.optional(),
			workspaceSlug: z
				.string({
					description:
						"The workspace slug to set as active. It can be null to unset the active workspace if workspaceId is not provided",
				})
				.optional(),
		}),
		use: [workspaceSessionMiddleware, workspaceMiddleware],
		metadata: {
			openapi: {
				description: "Set the active workspace",
				responses: {
					[HTTPStatus.codes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									description: "The workspace",
									$ref: "#/components/schemas/Workspace",
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
		const session = ctx.context.session;
		let idOrSlug = ctx.body.workspaceSlug || ctx.body.workspaceId;

		if (idOrSlug === null) {
			const sessionOrgId = session.session.activeWorkspaceId;
			if (!sessionOrgId) {
				return ctx.json(null);
			}
			const updatedSession = await adapter.setActiveWorkspace(session.session.token, null);
			await setSessionCookie(ctx, {
				session: updatedSession,
				user: session.user,
			});
			return ctx.json(null);
		}
		if (!idOrSlug) {
			const sessionOrgId = session.session.activeWorkspaceId;
			if (!sessionOrgId) {
				return ctx.json(null);
			}
			idOrSlug = sessionOrgId;
		}
		const workspace = await adapter.findFullWorkspace({
			workspaceId: idOrSlug,
			isSlug: !!ctx.body.workspaceSlug,
		});
		const isMember = workspace?.members.find((member) => member.userId === session.user.id);
		if (!isMember) {
			await adapter.setActiveWorkspace(session.session.token, null);
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.USER_IS_NOT_A_MEMBER_OF_THE_WORKSPACE,
			});
		}
		if (!workspace) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
			});
		}
		const updatedSession = await adapter.setActiveWorkspace(session.session.token, workspace.id);
		await setSessionCookie(ctx, {
			session: updatedSession,
			user: session.user,
		});
		return ctx.json(workspace);
	},
);

export const listWorkspaces = createAuthEndpoint(
	"/workspace/list",
	{
		method: "GET",
		use: [workspaceMiddleware, workspaceSessionMiddleware],
		metadata: {
			openapi: {
				description: "List all workspaces",
				responses: {
					[HTTPStatus.codes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										$ref: "#/components/schemas/Workspace",
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
		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		const workspaces = await adapter.listWorkspaces(ctx.context.session.user.id);
		return ctx.json(workspaces);
	},
);

type DefaultStatements = typeof defaultStatements;
type Statements = AccessControl extends AccessControl<infer S>
	? S extends Record<string, any>
		? S & DefaultStatements
		: DefaultStatements
	: DefaultStatements;

export const hasWorkspacePermission = (roles: Record<string, any>) =>
	createAuthEndpoint(
		"/workspace/has-permission",
		{
			method: "POST",
			requireHeaders: true,
			body: z.object({
				workspaceId: z.string().optional(),
				permission: z.record(z.string(), z.array(z.string())),
			}) as unknown as ZodObject<{
				permission: ZodObject<{
					[key in keyof Statements]: ZodOptional<
						//@ts-expect-error TODO: fix this
						ZodArray<ZodLiteral<Statements[key][number]>>
					>;
				}>;
				workspaceId: ZodOptional<ZodNumber>;
			}>,
			use: [workspaceSessionMiddleware],
			metadata: {
				openapi: {
					description: "Check if the user has permission",
					requestBody: {
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										permission: {
											type: "object",
											description: "The permission to check",
										},
									},
									required: ["permission"],
								},
							},
						},
					},
					responses: {
						[HTTPStatus.codes.OK]: {
							description: "Success",
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: {
											error: {
												type: "string",
											},
											success: {
												type: "boolean",
											},
										},
										required: ["success"],
									},
								},
							},
						},
					},
				},
			},
		},
		async (ctx) => {
			if (!ctx.body.permission || Object.keys(ctx.body.permission).length > 1) {
				throw new APIError("BAD_REQUEST", {
					message:
						"invalid permission check. you can only check one resource permission at a time.",
				});
			}
			const activeWorkspaceId =
				ctx.body.workspaceId || ctx.context.session.session.activeWorkspaceId;
			if (!activeWorkspaceId) {
				throw new APIError("BAD_REQUEST", {
					message: WORKSPACE_ERROR_CODES.NO_ACTIVE_WORKSPACE,
				});
			}
			const adapter = getOrgAdapter(ctx.context);
			const member = await adapter.findMemberByWorkspaceId({
				userId: ctx.context.session.user.id,
				workspaceId: activeWorkspaceId,
			});
			if (!member) {
				throw new APIError("UNAUTHORIZED", {
					message: WORKSPACE_ERROR_CODES.USER_IS_NOT_A_MEMBER_OF_THE_WORKSPACE,
				});
			}
			const role = roles[member.role];
			const result = role.authorize(ctx.body.permission);

			if (result.error) {
				return ctx.json(
					{
						error: result.error,
						success: false,
					},
					{
						status: 403,
					},
				);
			}

			return ctx.json({
				error: null,
				success: true,
			});
		},
	);
