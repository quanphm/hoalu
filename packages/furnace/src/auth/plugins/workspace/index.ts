import { createAuthEndpoint, getSessionFromCtx } from "better-auth/api";
import type { AuthContext, BetterAuthPlugin, Prettify, User } from "better-auth/types";
import { APIError } from "better-call";
import { type ZodArray, type ZodObject, type ZodOptional, type ZodString, z } from "zod";
import { shimContext } from "../../internal-utils/shim";
import {
	type AccessControl,
	type Role,
	defaultRoles,
	// type defaultStatements,
} from "better-auth/plugins/access";
import { getOrgAdapter } from "./adapter";
import { orgSessionMiddleware } from "./call";
import { WORKSPACE_ERROR_CODES } from "./error-codes";
import {
	acceptInvitation,
	cancelInvitation,
	createInvitation,
	getInvitation,
	rejectInvitation,
} from "./routes/crud-invites";
import { addMember, getActiveMember, removeMember, updateMemberRole } from "./routes/crud-members";
import {
	createOrganization,
	deleteOrganization,
	getFullOrganization,
	listOrganizations,
	setActiveOrganization,
	updateOrganization,
} from "./routes/crud-org";
import type { Invitation, Member, Workspace } from "./schema";

export interface WorkspaceOptions {
	/**
	 * Configure whether new users are able to create new organizations.
	 * You can also pass a function that returns a boolean.
	 *
	 * 	@example
	 * ```ts
	 * allowUserToCreateOrganization: async (user) => {
	 * 		const plan = await getUserPlan(user);
	 *      return plan.name === "pro";
	 * }
	 * ```
	 * @default true
	 */
	allowUserToCreateOrganization?: boolean | ((user: User) => Promise<boolean> | boolean);
	/**
	 * The maximum number of organizations a user can create.
	 *
	 * You can also pass a function that returns a boolean
	 */
	organizationLimit?: number | ((user: User) => Promise<boolean> | boolean);
	/**
	 * The role that is assigned to the creator of the
	 * organization.
	 *
	 * @default "owner"
	 */
	creatorRole?: string;
	/**
	 * The number of memberships a user can have in an organization.
	 *
	 * @default "unlimited"
	 */
	membershipLimit?: number;
	/**
	 * Configure the roles and permissions for the
	 * organization plugin.
	 */
	ac?: AccessControl;
	/**
	 * Custom permissions for roles.
	 */
	roles?: {
		[key in string]?: Role<any>;
	};
	/**
	 * The expiration time for the invitation link.
	 *
	 * @default 48 hours
	 */
	invitationExpiresIn?: number;
	/**
	 * Send an email with the
	 * invitation link to the user.
	 *
	 * Note: Better Auth doesn't
	 * generate invitation URLs.
	 * You'll need to construct the
	 * URL using the invitation ID
	 * and pass it to the
	 * acceptInvitation endpoint for
	 * the user to accept the
	 * invitation.
	 *
	 * @example
	 * ```ts
	 * sendInvitationEmail: async (data) => {
	 * 	const url = `https://yourapp.com/organization/
	 * accept-invitation?id=${data.id}`;
	 * 	await sendEmail(data.email, "Invitation to join
	 * organization", `Click the link to join the
	 * organization: ${url}`);
	 * }
	 * ```
	 */
	sendInvitationEmail?: (
		data: {
			/**
			 * the invitation id
			 */
			id: string;
			/**
			 * the role of the user
			 */
			role: string;
			/**
			 * the email of the user
			 */
			email: string;
			/**
			 * the organization the user is invited to join
			 */
			organization: Workspace;
			/**
			 * the member who is inviting the user
			 */
			inviter: Member & {
				user: User;
			};
		},
		/**
		 * The request object
		 */
		request?: Request,
	) => Promise<void>;
	/**
	 * The schema for the organization plugin.
	 */
	schema?: {
		session?: {
			fields?: {
				activeOrganizationId?: string;
			};
		};
		organization?: {
			modelName?: string;
			fields?: {
				[key in keyof Omit<Workspace, "id">]?: string;
			};
		};
		member?: {
			modelName?: string;
			fields?: {
				[key in keyof Omit<Member, "id">]?: string;
			};
		};
		invitation?: {
			modelName?: string;
			fields?: {
				[key in keyof Omit<Invitation, "id">]?: string;
			};
		};
	};
	/**
	 * Configure how organization deletion is handled
	 */
	organizationDeletion?: {
		/**
		 * disable deleting organization
		 */
		disabled?: boolean;
		/**
		 * A callback that runs before the organization is
		 * deleted
		 *
		 * @param data - organization and user object
		 * @param request - the request object
		 * @returns
		 */
		beforeDelete?: (
			data: {
				organization: Workspace;
				user: User;
			},
			request?: Request,
		) => Promise<void>;
		/**
		 * A callback that runs after the organization is
		 * deleted
		 *
		 * @param data - organization and user object
		 * @param request - the request object
		 * @returns
		 */
		afterDelete?: (
			data: {
				organization: Workspace;
				user: User;
			},
			request?: Request,
		) => Promise<void>;
	};
}

/**
 * Organization plugin for Better Auth. Organization allows you to create teams, members,
 * and manage access control for your users.
 *
 * @example
 * ```ts
 * const auth = createAuth({
 * 	plugins: [
 * 		workspace({
 * 			allowUserToCreateOrganization: true,
 * 		}),
 * 	],
 * });
 * ```
 */
export const workspace = <O extends WorkspaceOptions>(options?: O) => {
	const endpoints = {
		createOrganization,
		updateOrganization,
		deleteOrganization,
		setActiveOrganization,
		getFullOrganization,
		listOrganizations,
		createInvitation,
		cancelInvitation,
		acceptInvitation,
		getInvitation,
		rejectInvitation,
		addMember,
		removeMember,
		updateMemberRole,
		getActiveMember,
	};

	const roles = {
		...defaultRoles,
		...options?.roles,
	};

	const api = shimContext(endpoints, {
		orgOptions: options || {},
		roles,
		getSession: async (context: AuthContext) => {
			//@ts-expect-error
			return await getSessionFromCtx(context);
		},
	});

	// type DefaultStatements = typeof defaultStatements;
	// type Statements = O["ac"] extends AccessControl<infer S>
	// 	? S extends Record<string, any>
	// 		? S & DefaultStatements
	// 		: DefaultStatements
	// 	: DefaultStatements;

	return {
		id: "workspace",
		endpoints: {
			...api,
			hasPermission: createAuthEndpoint(
				"/organization/has-permission",
				{
					method: "POST",
					requireHeaders: true,
					body: z.object({
						organizationId: z.string().optional(),
						permission: z.record(z.string(), z.array(z.string())),
					}) as unknown as ZodObject<{
						// permission: ZodObject<{
						// 	[key in keyof Statements]: ZodOptional<
						// 		//@ts-expect-error TODO: fix this
						// 		ZodArray<ZodLiteral<Statements[key][number]>>
						// 	>;
						// }>;
						permission: ZodObject<{ ZodString: ZodArray<ZodString> }>;
						organizationId: ZodOptional<ZodString>;
					}>,
					use: [orgSessionMiddleware],
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
								"200": {
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
					const role = roles[member.role as keyof typeof roles];
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
			),
		},
		schema: {
			session: {
				fields: {
					activeOrganizationId: {
						type: "string",
						required: false,
						fieldName: options?.schema?.session?.fields?.activeOrganizationId,
					},
				},
			},
			organization: {
				modelName: options?.schema?.organization?.modelName,
				fields: {
					name: {
						type: "string",
						required: true,
						fieldName: options?.schema?.organization?.fields?.name,
					},
					slug: {
						type: "string",
						unique: true,
						fieldName: options?.schema?.organization?.fields?.slug,
					},
					logo: {
						type: "string",
						required: false,
						fieldName: options?.schema?.organization?.fields?.logo,
					},
					createdAt: {
						type: "date",
						required: true,
						fieldName: options?.schema?.organization?.fields?.createdAt,
					},
					metadata: {
						type: "string",
						required: false,
						fieldName: options?.schema?.organization?.fields?.metadata,
					},
				},
			},
			member: {
				modelName: options?.schema?.member?.modelName,
				fields: {
					organizationId: {
						type: "string",
						required: true,
						references: {
							model: "organization",
							field: "id",
						},
						fieldName: options?.schema?.member?.fields?.organizationId,
					},
					userId: {
						type: "string",
						required: true,
						fieldName: options?.schema?.member?.fields?.userId,
						references: {
							model: "user",
							field: "id",
						},
					},
					role: {
						type: "string",
						required: true,
						defaultValue: "member",
						fieldName: options?.schema?.member?.fields?.role,
					},
					createdAt: {
						type: "date",
						required: true,
						fieldName: options?.schema?.member?.fields?.createdAt,
					},
				},
			},
			invitation: {
				modelName: options?.schema?.invitation?.modelName,
				fields: {
					organizationId: {
						type: "string",
						required: true,
						references: {
							model: "organization",
							field: "id",
						},
						fieldName: options?.schema?.invitation?.fields?.organizationId,
					},
					email: {
						type: "string",
						required: true,
						fieldName: options?.schema?.invitation?.fields?.email,
					},
					role: {
						type: "string",
						required: false,
						fieldName: options?.schema?.invitation?.fields?.role,
					},
					status: {
						type: "string",
						required: true,
						defaultValue: "pending",
						fieldName: options?.schema?.invitation?.fields?.status,
					},
					expiresAt: {
						type: "date",
						required: true,
						fieldName: options?.schema?.invitation?.fields?.expiresAt,
					},
					inviterId: {
						type: "string",
						references: {
							model: "user",
							field: "id",
						},
						fieldName: options?.schema?.invitation?.fields?.inviterId,
						required: true,
					},
				},
			},
		},
		$Infer: {
			Organization: {} as Workspace,
			Invitation: {} as Invitation,
			Member: {} as Member,
			ActiveOrganization: {} as Prettify<
				Workspace & {
					members: Prettify<
						Member & {
							user: {
								id: string;
								name: string;
								email: string;
								image?: string | null;
							};
						}
					>[];
					invitations: Invitation[];
				}
			>,
		},
		$ERROR_CODES: WORKSPACE_ERROR_CODES,
	} satisfies BetterAuthPlugin;
};
