import type { Session as BetterAuthSession, User as BetterAuthUser } from "better-auth/types";

export type User = BetterAuthUser & { publicId: string };
export type Session = BetterAuthSession;
