import { createAuthMiddleware, sessionMiddleware } from "better-auth/api";
import type { Role, defaultRoles } from "better-auth/plugins/access";
import type { Context } from "better-call";
import type { Session, User } from "../../utils/types";
import type { WorkspaceOptions } from "./index";

export const workspaceMiddleware = createAuthMiddleware(async (ctx) => {
	return {} as {
		orgOptions: WorkspaceOptions;
		roles: typeof defaultRoles & {
			// biome-ignore lint/complexity/noBannedTypes: bypass this
			[key: string]: Role<{}>;
		};
		getSession: (context: Context<any, any>) => Promise<{
			session: Session & {
				activeWorkspaceId?: number;
			};
			user: User;
		}>;
	};
});

export const workspaceSessionMiddleware = createAuthMiddleware(
	{
		use: [sessionMiddleware],
	},
	async (ctx) => {
		const session = ctx.context.session as unknown as {
			session: Session & {
				activeWorkspaceId?: number;
			};
			user: User;
		};
		return {
			session,
		};
	},
);
