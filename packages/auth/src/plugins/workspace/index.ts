import type { AuthContext, BetterAuthPlugin } from "better-auth";
import { getSessionFromCtx } from "better-auth/api";
import type { AccessControl, Role } from "better-auth/plugins/access";

import { shimContext } from "../../utils/shim";
import type { User } from "../../utils/types";
import { defaultRoles } from "./access";
import { WORKSPACE_ERROR_CODES } from "./error-codes";
import {
	acceptInvitation,
	cancelInvitation,
	createInvitation,
	getInvitation,
	listInvitations,
	rejectInvitation,
} from "./routes/crud-invites";
import { addMember, getActiveMember, removeMember, updateMemberRole } from "./routes/crud-members";
import {
	checkWorkspaceSlug,
	createWorkspace,
	deleteWorkspace,
	getFullWorkspace,
	hasWorkspacePermission,
	listWorkspaces,
	updateWorkspace,
} from "./routes/crud-workspaces";
import type { Invitation, Member, Workspace } from "./schema";

export interface WorkspaceOptions {
	/**
	 * Configure whether new users are able to create new workspaces.
	 * You can also pass a function that returns a boolean.
	 *
	 * 	@example
	 * ```ts
	 * allowUserToCreateWorkspace: async (user) => {
	 * 		const plan = await getUserPlan(user);
	 *      return plan.name === "pro";
	 * }
	 * ```
	 * @default true
	 */
	allowUserToCreateWorkspace?: boolean | ((user: User) => Promise<boolean> | boolean);
	/**
	 * The maximum number of workspaces a user can create.
	 *
	 * You can also pass a function that returns a boolean
	 */
	workspaceLimit?: number | ((user: User) => Promise<boolean> | boolean);
	/**
	 * The role that is assigned to the creator of the workspace.
	 *
	 * @default "owner"
	 */
	creatorRole?: string;
	/**
	 * The number of memberships a user can have in an workspace.
	 *
	 * @default 100
	 */
	membershipLimit?: number;
	/**
	 * Configure the roles and permissions for the workspace plugin.
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
	 * 	const url = `https://yourapp.com/workspace/
	 * accept-invitation?id=${data.id}`;
	 * 	await sendEmail(data.email, "Invitation to join
	 * workspace", `Click the link to join the
	 * workspace: ${url}`);
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
			 * the workspace the user is invited to join
			 */
			workspace: Workspace;
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
	 * Configure how workspace creation is handled
	 */
	workspaceCreation?: {
		disabled?: boolean;
		/**
		 * A callback that runs before the workspace is created
		 *
		 * @param data - workspace and user object
		 * @param request - the request object
		 * @returns
		 */
		beforeCreate?: (
			data: {
				user: User;
			},
			request?: Request,
		) => Promise<void>;
		/**
		 * A callback that runs after the workspace is created
		 *
		 * @param data - workspace and user object
		 * @param request - the request object
		 * @returns
		 */
		afterCreate?: (
			data: {
				workspace: Workspace;
				user: User;
			},
			request?: Request,
		) => Promise<void>;
	};
	/**
	 * Configure how workspace deletion is handled
	 */
	workspaceDeletion?: {
		/**
		 * disable deleting workspace
		 */
		disabled?: boolean;
		/**
		 * A callback that runs before the workspace is deleted
		 *
		 * @param data - workspace and user object
		 * @param request - the request object
		 * @returns
		 */
		beforeDelete?: (
			data: {
				workspace: Workspace;
				user: User;
			},
			request?: Request,
		) => Promise<void>;
		/**
		 * A callback that runs after the workspace is
		 * deleted
		 *
		 * @param data - workspace and user object
		 * @param request - the request object
		 * @returns
		 */
		afterDelete?: (
			data: {
				workspace: Workspace;
				user: User;
			},
			request?: Request,
		) => Promise<void>;
	};
}

/**
 * Workspace plugin for Better Auth. Workspace allows you to create teams, members,
 * and manage access control for your users.
 *
 * @example
 * ```ts
 * const auth = createAuth({
 * 	plugins: [
 * 		workspace({
 * 			allowUserToCreateWorkspace: true,
 * 		}),
 * 	],
 * });
 * ```
 */
const workspace = <O extends WorkspaceOptions>(options?: O) => {
	const roles = {
		...defaultRoles,
		...options?.roles,
	};

	const endpoints = {
		checkWorkspaceSlug,
		createWorkspace,
		updateWorkspace,
		deleteWorkspace,
		getFullWorkspace,
		listWorkspaces,
		listInvitations,
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
					publicId: {
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
						type: "string",
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
					id: {
						type: "string",
						required: true,
					},
					workspaceId: {
						type: "string",
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
		},
		$ERROR_CODES: WORKSPACE_ERROR_CODES,
	} satisfies BetterAuthPlugin;
};

export { workspace, WORKSPACE_ERROR_CODES };
