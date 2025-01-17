import { generateId } from "@woben/common/generate-id";
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
import { StatusCodes } from "../../../../utils";
import { getOrgAdapter } from "../adapter";
import { workspaceMiddleware, workspaceSessionMiddleware } from "../call";
import { WORKSPACE_ERROR_CODES } from "../error-codes";

export const createOrganization = createAuthEndpoint(
	"/organization/create",
	{
		method: "POST",
		body: z.object({
			name: z.string({
				description: "The name of the organization",
			}),
			slug: z.string({
				description: "The slug of the organization",
			}),
			userId: z
				.string({
					description:
						"The user id of the organization creator. If not provided, the current user will be used. Should only be used by admins or when called by the server.",
				})
				.optional(),
			logo: z
				.string({
					description: "The logo of the organization",
				})
				.optional(),
			metadata: z
				.record(z.string(), z.any(), {
					description: "The metadata of the organization",
				})
				.optional(),
		}),
		use: [workspaceMiddleware],
		metadata: {
			openapi: {
				description: "Create an organization",
				responses: {
					[StatusCodes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									description: "The organization that was created",
									$ref: "#/components/schemas/Organization",
								},
							},
						},
					},
				},
			},
		},
	},
	async (ctx) => {
		const session = await getSessionFromCtx(ctx);
		if (!session && (ctx.request || ctx.headers)) {
			throw new APIError("UNAUTHORIZED");
		}
		let user = session?.user || null;
		if (!user) {
			if (!ctx.body.userId) {
				throw new APIError("UNAUTHORIZED");
			}
			user = await ctx.context.internalAdapter.findUserById(ctx.body.userId);
		}
		if (!user) {
			return ctx.json(null, {
				status: StatusCodes.UNAUTHORIZED,
			});
		}
		const options = ctx.context.orgOptions;
		const canCreateOrg =
			typeof options?.allowUserToCreateOrganization === "function"
				? await options.allowUserToCreateOrganization(user)
				: options?.allowUserToCreateOrganization === undefined
					? true
					: options.allowUserToCreateOrganization;

		if (!canCreateOrg) {
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.YOU_ARE_NOT_ALLOWED_TO_CREATE_A_NEW_WORKSPACE,
			});
		}
		const adapter = getOrgAdapter(ctx.context, options);

		const userOrganizations = await adapter.listOrganizations(user.id);
		const hasReachedOrgLimit =
			typeof options.organizationLimit === "number"
				? userOrganizations.length >= options.organizationLimit
				: typeof options.organizationLimit === "function"
					? await options.organizationLimit(user)
					: false;

		if (hasReachedOrgLimit) {
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_WORKSPACES,
			});
		}

		const existingOrganization = await adapter.findOrganizationBySlug(ctx.body.slug);
		if (existingOrganization) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.WORKSPACE_ALREADY_EXISTS,
			});
		}
		const organization = await adapter.createOrganization({
			organization: {
				slug: ctx.body.slug,
				name: ctx.body.name,
				logo: ctx.body.logo,
				publicId: generateId("workspace"),
				createdAt: new Date(),
				metadata: ctx.body.metadata,
			},
			user,
		});
		if (ctx.context.session) {
			await adapter.setActiveOrganization(ctx.context.session.session.token, organization.id);
		}
		return ctx.json(organization);
	},
);

export const updateOrganization = createAuthEndpoint(
	"/organization/update",
	{
		method: "POST",
		body: z.object({
			data: z
				.object({
					name: z
						.string({
							description: "The name of the organization",
						})
						.optional(),
					slug: z
						.string({
							description: "The slug of the organization",
						})
						.optional(),
					logo: z
						.string({
							description: "The logo of the organization",
						})
						.optional(),
					metadata: z
						.record(z.string(), z.any(), {
							description: "The metadata of the organization",
						})
						.optional(),
				})
				.partial(),
			organizationId: z.number().optional(),
		}),
		requireHeaders: true,
		use: [workspaceMiddleware],
		metadata: {
			openapi: {
				description: "Update an organization",
				responses: {
					[StatusCodes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									description: "The updated organization",
									$ref: "#/components/schemas/Organization",
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
		const organizationId = ctx.body.organizationId || session.session.activeOrganizationId;
		if (!organizationId) {
			return ctx.json(null, {
				status: StatusCodes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
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
				status: StatusCodes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.USER_IS_NOT_A_MEMBER_OF_THE_WORKSPACE,
				},
			});
		}
		const role = ctx.context.roles[member.role];
		if (!role) {
			return ctx.json(null, {
				status: StatusCodes.BAD_REQUEST,
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
		const updatedOrg = await adapter.updateOrganization(organizationId, ctx.body.data);
		return ctx.json(updatedOrg);
	},
);

export const deleteOrganization = createAuthEndpoint(
	"/organization/delete",
	{
		method: "POST",
		body: z.object({
			organizationId: z.number({
				description: "The organization id to delete",
			}),
		}),
		requireHeaders: true,
		use: [workspaceMiddleware],
		metadata: {
			openapi: {
				description: "Delete an organization",
				responses: {
					[StatusCodes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "string",
									description: "The organization id that was deleted",
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
				status: StatusCodes.UNAUTHORIZED,
			});
		}
		const organizationId = ctx.body.organizationId;
		if (!organizationId) {
			return ctx.json(null, {
				status: StatusCodes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
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
				status: StatusCodes.BAD_REQUEST,
				body: {
					message: WORKSPACE_ERROR_CODES.USER_IS_NOT_A_MEMBER_OF_THE_WORKSPACE,
				},
			});
		}
		const role = ctx.context.roles[member.role];
		if (!role) {
			return ctx.json(null, {
				status: StatusCodes.BAD_REQUEST,
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
		if (
			session.session.activeOrganizationId &&
			organizationId === session.session.activeOrganizationId
		) {
			/**
			 * If the organization is deleted, we set the active organization to null
			 */
			await adapter.setActiveOrganization(session.session.token, null);
		}
		const option = ctx.context.orgOptions.organizationDeletion;
		if (option?.disabled) {
			throw new APIError("FORBIDDEN");
		}
		const org = await adapter.findOrganizationById(organizationId);
		if (!org) {
			throw new APIError("BAD_REQUEST");
		}
		if (option?.beforeDelete) {
			await option.beforeDelete({
				organization: org,
				user: session.user,
			});
		}
		await adapter.deleteOrganization(organizationId);
		if (option?.afterDelete) {
			await option.afterDelete({
				organization: org,
				user: session.user,
			});
		}
		return ctx.json(org);
	},
);

export const getFullOrganization = createAuthEndpoint(
	"/organization/get-full-organization",
	{
		method: "GET",
		query: z.optional(
			z.object({
				organizationId: z
					.number({
						description: "The organization id to get",
					})
					.optional(),
				organizationSlug: z
					.string({
						description: "The organization slug to get",
					})
					.optional(),
			}),
		),
		requireHeaders: true,
		use: [workspaceMiddleware, workspaceSessionMiddleware],
		metadata: {
			openapi: {
				description: "Get the full organization",
				responses: {
					[StatusCodes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									description: "The organization",
									$ref: "#/components/schemas/Organization",
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
		const organizationId = ctx.query?.organizationId || session.session.activeOrganizationId;
		const organizationSlug = ctx.query?.organizationSlug;

		if (!organizationId && !organizationSlug) {
			return ctx.json(null, {
				status: 200,
			});
		}

		const adapter = getOrgAdapter(ctx.context, ctx.context.orgOptions);
		let organization: Awaited<ReturnType<typeof adapter.findFullOrganization>> = null;

		if (organizationId) {
			organization = await adapter.findFullOrganization({
				organizationId: organizationId,
			});
		} else if (organizationSlug) {
			organization = await adapter.findFullOrganization({
				organizationId: organizationSlug,
				isSlug: true,
			});
		}

		if (!organization) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
			});
		}

		const isMember = organization.members.find((member) => member.userId === session.user.id);
		if (!isMember) {
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.USER_IS_NOT_A_MEMBER_OF_THE_WORKSPACE,
			});
		}

		return ctx.json(organization);
	},
);

export const setActiveOrganization = createAuthEndpoint(
	"/organization/set-active",
	{
		method: "POST",
		body: z.object({
			organizationId: z
				.number({
					description:
						"The organization id to set as active. It can be null to unset the active organization",
				})
				.nullable()
				.optional(),
			organizationSlug: z
				.string({
					description:
						"The organization slug to set as active. It can be null to unset the active organization if organizationId is not provided",
				})
				.optional(),
		}),
		use: [workspaceSessionMiddleware, workspaceMiddleware],
		metadata: {
			openapi: {
				description: "Set the active organization",
				responses: {
					[StatusCodes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "object",
									description: "The organization",
									$ref: "#/components/schemas/Organization",
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
		let organizationId = ctx.body.organizationSlug || ctx.body.organizationId;

		if (organizationId === null) {
			const sessionOrgId = session.session.activeOrganizationId;
			if (!sessionOrgId) {
				return ctx.json(null);
			}
			const updatedSession = await adapter.setActiveOrganization(session.session.token, null);
			await setSessionCookie(ctx, {
				session: updatedSession,
				user: session.user,
			});
			return ctx.json(null);
		}
		if (!organizationId) {
			const sessionOrgId = session.session.activeOrganizationId;
			if (!sessionOrgId) {
				return ctx.json(null);
			}
			organizationId = sessionOrgId;
		}
		const organization = await adapter.findFullOrganization({
			organizationId,
			isSlug: !!ctx.body.organizationSlug,
		});
		const isMember = organization?.members.find((member) => member.userId === session.user.id);
		if (!isMember) {
			await adapter.setActiveOrganization(session.session.token, null);
			throw new APIError("FORBIDDEN", {
				message: WORKSPACE_ERROR_CODES.USER_IS_NOT_A_MEMBER_OF_THE_WORKSPACE,
			});
		}
		if (!organization) {
			throw new APIError("BAD_REQUEST", {
				message: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND,
			});
		}
		const updatedSession = await adapter.setActiveOrganization(
			session.session.token,
			organization.id,
		);
		await setSessionCookie(ctx, {
			session: updatedSession,
			user: session.user,
		});
		return ctx.json(organization);
	},
);

export const listOrganizations = createAuthEndpoint(
	"/organization/list",
	{
		method: "GET",
		use: [workspaceMiddleware, workspaceSessionMiddleware],
		metadata: {
			openapi: {
				description: "List all organizations",
				responses: {
					[StatusCodes.OK]: {
						description: "Success",
						content: {
							"application/json": {
								schema: {
									type: "array",
									items: {
										$ref: "#/components/schemas/Organization",
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
		const organizations = await adapter.listOrganizations(ctx.context.session.user.id);
		return ctx.json(organizations);
	},
);

type DefaultStatements = typeof defaultStatements;
type Statements = AccessControl extends AccessControl<infer S>
	? S extends Record<string, any>
		? S & DefaultStatements
		: DefaultStatements
	: DefaultStatements;

export const hasOrganizationPermission = (roles: Record<string, any>) =>
	createAuthEndpoint(
		"/organization/has-permission",
		{
			method: "POST",
			requireHeaders: true,
			body: z.object({
				organizationId: z.string().optional(),
				permission: z.record(z.string(), z.array(z.string())),
			}) as unknown as ZodObject<{
				permission: ZodObject<{
					[key in keyof Statements]: ZodOptional<
						//@ts-expect-error TODO: fix this
						ZodArray<ZodLiteral<Statements[key][number]>>
					>;
				}>;
				organizationId: ZodOptional<ZodNumber>;
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
						[StatusCodes.OK]: {
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
			const activeOrganizationId =
				ctx.body.organizationId || ctx.context.session.session.activeOrganizationId;
			if (!activeOrganizationId) {
				throw new APIError("BAD_REQUEST", {
					message: WORKSPACE_ERROR_CODES.NO_ACTIVE_WORKSPACE,
				});
			}
			const adapter = getOrgAdapter(ctx.context);
			const member = await adapter.findMemberByOrgId({
				userId: ctx.context.session.user.id,
				organizationId: activeOrganizationId,
			});
			if (!member) {
				throw new APIError("UNAUTHORIZED", {
					message: WORKSPACE_ERROR_CODES.USER_IS_NOT_A_MEMBER_OF_THE_WORKSPACE,
				});
			}
			const role = roles[member.role];
			const result = role.authorize(ctx.body.permission as any);

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
