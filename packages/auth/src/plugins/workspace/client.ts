import { BetterAuthError } from "better-auth";
import { useAuthQuery } from "better-auth/client";
import {
	type AccessControl,
	type Role,
	adminAc,
	type defaultStatements,
	memberAc,
	ownerAc,
} from "better-auth/plugins/access";
import type { Prettify } from "better-auth/types";
import type { BetterAuthClientPlugin } from "better-auth/types";
import { atom } from "nanostores";
import type { workspace } from "./index";
import type { Invitation, Member, Workspace } from "./schema";

interface WorkspaceClientOptions {
	ac: AccessControl;
	roles: {
		[key in string]: Role;
	};
}

export const workspaceClient = <O extends WorkspaceClientOptions>(options?: O) => {
	const $listWorkspace = atom<boolean>(false);
	const $activeWorkspaceSignal = atom<boolean>(false);
	const $activeMemberSignal = atom<boolean>(false);

	type DefaultStatements = typeof defaultStatements;
	type Statements = O["ac"] extends AccessControl<infer S>
		? S extends Record<string, Array<any>>
			? S & DefaultStatements
			: DefaultStatements
		: DefaultStatements;

	const roles = {
		admin: adminAc,
		member: memberAc,
		owner: ownerAc,
		...options?.roles,
	};

	return {
		id: "workspace",
		$InferServerPlugin: {} as ReturnType<
			typeof workspace<{
				ac: O["ac"] extends AccessControl ? O["ac"] : AccessControl<DefaultStatements>;
				roles: O["roles"] extends Record<string, Role>
					? O["roles"]
					: {
							admin: Role;
							member: Role;
							owner: Role;
						};
			}>
		>,
		getActions: ($fetch) => ({
			$Infer: {
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
				Workspace: {} as Workspace,
				Invitation: {} as Invitation,
				Member: {} as Member,
			},
			workspace: {
				checkRolePermission: <
					R extends O extends { roles: any } ? keyof O["roles"] : "admin" | "member" | "owner",
				>(data: {
					role: R;
					permission: {
						//@ts-expect-error fix this later
						[key in keyof Statements]?: Statements[key][number][];
					};
				}) => {
					if (Object.keys(data.permission).length > 1) {
						throw new BetterAuthError("you can only check one resource permission at a time.");
					}
					const role = roles[data.role as unknown as "admin"];
					if (!role) {
						return false;
					}
					const isAuthorized = role?.authorize(data.permission as any);
					return isAuthorized.success;
				},
			},
		}),
		getAtoms: ($fetch) => {
			const listWorkspaces = useAuthQuery<Workspace[]>($listWorkspace, "/workspace/list", $fetch, {
				method: "GET",
			});

			const activeWorkspace = useAuthQuery<
				Prettify<
					Workspace & {
						members: (Member & {
							user: {
								id: string;
								name: string;
								email: string;
								image: string | undefined;
							};
						})[];
						invitations: Invitation[];
					}
				>
			>([$activeWorkspaceSignal], "/workspace/get-full-workspace", $fetch, () => ({
				method: "GET",
			}));

			const activeMember = useAuthQuery<Member>(
				[$activeMemberSignal],
				"/workspace/get-active-member",
				$fetch,
				{
					method: "GET",
				},
			);

			return {
				$listWorkspace,
				$activeWorkspaceSignal,
				$activeMemberSignal,
				listWorkspaces,
				activeWorkspace,
				activeMember,
			};
		},
		pathMethods: {
			"/workspace/get-full-workspace": "GET",
		},
		atomListeners: [
			{
				matcher(path) {
					return (
						path === "/workspace/create" ||
						path === "/workspace/delete" ||
						path === "/workspace/update"
					);
				},
				signal: "$listOrg",
			},
			{
				matcher(path) {
					return path.startsWith("/workspace");
				},
				signal: "$activeOrgSignal",
			},
			{
				matcher(path) {
					return path.includes("/workspace/update-member-role");
				},
				signal: "$activeMemberSignal",
			},
		],
	} satisfies BetterAuthClientPlugin;
};
