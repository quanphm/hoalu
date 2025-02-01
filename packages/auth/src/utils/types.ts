import type { Session as BetterAuthSession, User as BetterAuthUser } from "better-auth/types";

export type User = Omit<BetterAuthUser, "id"> & {
	id: number;
	publicId: string;
};

export type Session = Omit<BetterAuthSession, "id" | "userId"> & {
	id: number;
	userId: number;
};
