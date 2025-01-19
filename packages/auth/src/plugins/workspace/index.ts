import { getSessionFromCtx } from "better-auth/api";
import { type AccessControl, type Role, defaultRoles } from "better-auth/plugins/access";
import type { AuthContext, BetterAuthPlugin, Prettify, User } from "better-auth/types";
import { shimContext } from "../../utils/shim";
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
	createWorkspace,
	deleteWorkspace,
	getFullWorkspace,
	hasWorkspacePermission,
	listWorkspaces,
	setActiveWorkspace,
	updateWorkspace,
} from "./routes/crud-workspaces";
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
	 * @default 24 hours
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
			id: number;
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
	const roles = {
		...defaultRoles,
		...options?.roles,
	};

	const endpoints = {
		createWorkspace,
		updateWorkspace,
		deleteWorkspace,
		setActiveWorkspace,
		getFullWorkspace,
		listWorkspaces,
		createInvitation,
		cancelInvitation,
		acceptInvitation,
		getInvitation,
		rejectInvitation,
		addMember,
		removeMember,
		updateMemberRole,
		getActiveMember,
		hasWorkspacePermission: hasWorkspacePermission(roles),
	};

	const api = shimContext(endpoints, {
		orgOptions: options || {},
		roles,
		getSession: async (context: AuthContext) => {
			//@ts-expect-error
			return await getSessionFromCtx(context);
		},
	});

	return {
		id: "workspace",
		endpoints: api,
		schema: {
			session: {
				fields: {
					activeOrganizationId: {
						type: "number",
						required: false,
					},
				},
			},
			workspace: {
				fields: {
					name: {
						type: "string",
						required: true,
					},
					slug: {
						type: "string",
						unique: true,
						required: true,
					},
					logo: {
						type: "string",
						required: false,
					},
					createdAt: {
						type: "date",
						required: true,
					},
					metadata: {
						type: "string",
						required: false,
					},
				},
			},
			member: {
				fields: {
					workspaceId: {
						type: "number",
						required: true,
						references: {
							model: "workspace",
							field: "id",
						},
					},
					userId: {
						type: "string",
						required: true,
						references: {
							model: "user",
							field: "id",
						},
					},
					role: {
						type: "string",
						required: true,
						defaultValue: "member",
					},
					createdAt: {
						type: "date",
						required: true,
					},
				},
			},
			invitation: {
				fields: {
					workspaceId: {
						type: "number",
						required: true,
						references: {
							model: "workspace",
							field: "id",
						},
					},
					email: {
						type: "string",
						required: true,
					},
					role: {
						type: "string",
						required: false,
					},
					status: {
						type: "string",
						required: true,
						defaultValue: "pending",
					},
					expiresAt: {
						type: "date",
						required: true,
					},
					inviterId: {
						type: "string",
						references: {
							model: "user",
							field: "id",
						},
						required: true,
					},
				},
			},
		},
		$Infer: {
			Workspace: {} as Workspace,
			Invitation: {} as Invitation,
			Member: {} as Member,
			ActiveWorkspace: {} as Prettify<
				Workspace & {
					members: Prettify<
						Member & {
							user: {
								id: string;
								name: string;
								email: string;
								publicId: string;
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
