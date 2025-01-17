import { createAuthMiddleware, sessionMiddleware } from "better-auth/api";
import type { Session, User } from "better-auth/types";
import type { Context } from "better-call";
import type { Role, defaultRoles } from "better-auth/plugins/access";
import type { WorkspaceOptions } from "./index";

export const orgMiddleware = createAuthMiddleware(async (ctx) => {
	return {} as {
		orgOptions: WorkspaceOptions;
		roles: typeof defaultRoles & {
			// biome-ignore lint/complexity/noBannedTypes: bypass this
			[key: string]: Role<{}>;
		};
		getSession: (context: Context<any, any>) => Promise<{
			session: Session & {
				activeOrganizationId?: string;
			};
			user: User;
		}>;
	};
});

export const orgSessionMiddleware = createAuthMiddleware(
	{
		use: [sessionMiddleware],
	},
	async (ctx) => {
		const session = ctx.context.session as {
			session: Session & {
				activeOrganizationId?: string;
			};
			user: User;
		};
		return {
			session,
		};
	},
);
