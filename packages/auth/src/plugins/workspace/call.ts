import { createAuthMiddleware, sessionMiddleware } from "better-auth/api";
import type { Role } from "better-auth/plugins/access";

import type { GenericEndpointContext, Session, User } from "../../utils/types";
import type { defaultRoles } from "./access/statement";
import type { WorkspaceOptions } from "./index";

export const workspaceMiddleware = createAuthMiddleware(async () => {
	return {} as {
		orgOptions: WorkspaceOptions;
		roles: typeof defaultRoles & {
			[key: string]: Role<Record<string, any>>;
		};
		getSession: (context: GenericEndpointContext) => Promise<{
			session: Session;
			user: User;
		}>;
	};
});

export const workspaceSessionMiddleware = createAuthMiddleware(
	{
		use: [sessionMiddleware],
	},
	async (ctx) => {
		const session = ctx.context.session as {
			session: Session;
			user: User;
		};
		return {
			session,
		};
	},
);
