import type {
	Session as BetterAuthSession,
	User as BetterAuthUser,
	GenericEndpointContext,
} from "better-auth";

type User = BetterAuthUser & { publicId: string };
type Session = BetterAuthSession;

export type { GenericEndpointContext, User, Session };
