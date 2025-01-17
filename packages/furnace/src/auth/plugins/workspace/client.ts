import { BetterAuthError } from "better-auth";
import { useAuthQuery } from "better-auth/client";
import type { Prettify } from "better-auth/types";
import type { BetterAuthClientPlugin } from "better-auth/types";
import { atom } from "nanostores";
import {
	type AccessControl,
	type Role,
	adminAc,
	type defaultStatements,
	memberAc,
	ownerAc,
} from "./access";
import type { workspace } from "./index";
import type { Invitation, Member, Workspace } from "./schema";

interface OrganizationClientOptions {
	ac: AccessControl;
	roles: {
		[key in string]: Role;
	};
}

export const organizationClient = <O extends OrganizationClientOptions>(options?: O) => {
	const $listOrg = atom<boolean>(false);
	const $activeOrgSignal = atom<boolean>(false);
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
		id: "organization",
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
				Organization: {} as Workspace,
				Invitation: {} as Invitation,
				Member: {} as Member,
			},
			organization: {
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
			const listOrganizations = useAuthQuery<Workspace[]>($listOrg, "/organization/list", $fetch, {
				method: "GET",
			});
			const activeOrganization = useAuthQuery<
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
			>([$activeOrgSignal], "/organization/get-full-organization", $fetch, () => ({
				method: "GET",
			}));

			const activeMember = useAuthQuery<Member>(
				[$activeMemberSignal],
				"/organization/get-active-member",
				$fetch,
				{
					method: "GET",
				},
			);

			return {
				$listOrg,
				$activeOrgSignal,
				$activeMemberSignal,
				activeOrganization,
				listOrganizations,
				activeMember,
			};
		},
		pathMethods: {
			"/organization/get-full-organization": "GET",
		},
		atomListeners: [
			{
				matcher(path) {
					return path === "/organization/create" || path === "/organization/delete";
				},
				signal: "$listOrg",
			},
			{
				matcher(path) {
					return path.startsWith("/organization");
				},
				signal: "$activeOrgSignal",
			},
			{
				matcher(path) {
					return path.includes("/organization/update-member-role");
				},
				signal: "$activeMemberSignal",
			},
		],
	} satisfies BetterAuthClientPlugin;
};
