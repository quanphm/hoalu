import { generateId } from "@hoalu/common/generate-id";
import { HTTPStatus } from "@hoalu/common/http-status";
import { createAuthEndpoint, requestOnlySessionMiddleware } from "better-auth/api";
import type { AccessControl, Role } from "better-auth/plugins/access";
import { APIError } from "better-call";
import { type ZodArray, type ZodObject, type ZodOptional, type ZodString, z } from "zod";
import type { Session, User } from "../../../utils/types";
import { defaultRoles, type defaultStatements } from "../access";
import { getAdapter } from "../adapter";
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
		const session = await ctx.context.getSession(ctx);
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
		const adapter = getAdapter(ctx.context, options);

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

		const existingWorkspace = await adapter.findWorkspace(ctx.body.slug);
		if (existingWorkspace) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.WORKSPACE_ALREADY_EXISTS,
			});
		}

		const option = ctx.context.orgOptions.workspaceCreation;
		if (option?.disabled) {
			throw new APIError("FORBIDDEN");
		}

		if (option?.beforeCreate) {
			await option.beforeCreate({ user: session.user });
		}

		const workspace = await adapter.createWorkspace({
			workspace: {
				slug: ctx.body.slug,
				name: ctx.body.name,
				publicId: generateId({ use: "nanoid", kind: "workspace" }),
				logo: ctx.body.logo,
				createdAt: new Date(),
				metadata: ctx.body.metadata
					? { currency: "USD", ...ctx.body.metadata }
					: { currency: "USD" },
			},
			user: user,
		});

		if (option?.afterCreate) {
			await option.afterCreate({ workspace, user: session.user });
		}

		return ctx.json(workspace);
	},
);

export const checkWorkspaceSlug = createAuthEndpoint(
	"/workspace/check-slug",
	{
		method: "POST",
		body: z.object({
			slug: z.string(),
		}),
		use: [requestOnlySessionMiddleware, workspaceMiddleware],
	},
	async (ctx) => {
		const adapter = getAdapter(ctx.context);
		const workspace = await adapter.findWorkspace(ctx.body.slug);
		if (!workspace) {
			return ctx.json({
				status: true,
			});
		}
		throw new APIError("BAD_REQUEST", {
			message: WORKSPACE_ERROR_CODES.WORKSPACE_SLUG_ALREADY_EXISTS,
		});
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
			idOrSlug: z.string({
				description: "The workspace public_id or slug to update",
			}),
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
			throw new APIError("UNAUTHORIZED");
		}
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
		const member = await adapter.findMemberByWorkspaceId({
			userId: session.user.id,
			workspaceId: workspace.id,
		});
		if (!member) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.USER_IS_NOT_A_MEMBER_OF_THE_WORKSPACE,
			});
		}
		const role = ctx.context.roles[member.role];
		if (!role) {
			throw new APIError("BAD_REQUEST", {
				message: "Role not found!",
			});
		}
		const canUpdateOrg = role.authorize({
			organization: ["update"],
		});
		if (canUpdateOrg.error) {
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_WORKSPACE,
			});
		}
		if (ctx.body.data.slug) {
			const existingSlug = await adapter.findWorkspace(ctx.body.data.slug);
			if (existingSlug) {
				throw new APIError("BAD_REQUEST", {
					message: WORKSPACE_ERROR_CODES.WORKSPACE_SLUG_ALREADY_EXISTS,
				});
			}
		}
		const updatedOrg = await adapter.updateWorkspace(workspace.id, ctx.body.data);
		return ctx.json(updatedOrg);
	},
);

export const deleteWorkspace = createAuthEndpoint(
	"/workspace/delete",
	{
		method: "POST",
		body: z.object({
			idOrSlug: z.string({
				description: "The workspace public_id or slug to delete",
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
									description: "The workspace that was deleted",
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
			throw new APIError("UNAUTHORIZED");
		}
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
		const member = await adapter.findMemberByWorkspaceId({
			userId: session.user.id,
			workspaceId: workspace.id,
		});
		if (!member) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.USER_IS_NOT_A_MEMBER_OF_THE_WORKSPACE,
			});
		}
		const role = ctx.context.roles[member.role];
		if (!role) {
			throw new APIError("BAD_REQUEST", {
				message: "Role not found!",
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
		const option = ctx.context.orgOptions.workspaceDeletion;
		if (option?.disabled) {
			throw new APIError("FORBIDDEN");
		}
		if (option?.beforeDelete) {
			await option.beforeDelete({
				workspace,
				user: session.user,
			});
		}
		await adapter.deleteWorkspace(workspace.id);
		if (option?.afterDelete) {
			await option.afterDelete({
				workspace,
				user: session.user,
			});
		}
		return ctx.json(workspace);
	},
);

export const getFullWorkspace = createAuthEndpoint(
	"/workspace/get-full-workspace",
	{
		method: "GET",
		query: z.object({
			idOrSlug: z.string({
				description: "The workspace public_id or slug to get",
			}),
		}),
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
		const idOrSlug = ctx.query?.idOrSlug;
		if (!idOrSlug) {
			throw new APIError("BAD_REQUEST", {
				message: HTTPStatus.phrases.BAD_REQUEST,
			});
		}

		const adapter = getAdapter(ctx.context, ctx.context.orgOptions);
		const workspace = await adapter.findFullWorkspace(idOrSlug);
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
		const adapter = getAdapter(ctx.context, ctx.context.orgOptions);
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
				permission: z.record(z.string(), z.array(z.string())),
				idOrSlug: z.string({
					description: "The workspace public_id or slug to delete",
				}),
			}) as unknown as ZodObject<{
				permission: ZodObject<{
					[key in keyof Statements]: ZodOptional<
						//@ts-expect-error TODO: fix this
						ZodArray<ZodLiteral<Statements[key][number]>>
					>;
				}>;
				idOrSlug: ZodString;
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

			const idOrSlug = ctx.body.idOrSlug;
			if (!idOrSlug) {
				throw new APIError("BAD_REQUEST", {
					message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
				});
			}
			const adapter = getAdapter(ctx.context);
			const workspace = await adapter.findWorkspace(idOrSlug);
			if (!workspace) {
				throw new APIError("BAD_REQUEST", {
					message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
				});
			}
			const member = await adapter.findMemberByWorkspaceId({
				userId: ctx.context.session.user.id,
				workspaceId: workspace.id,
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
