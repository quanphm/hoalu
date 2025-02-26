/**
 * @see - Fundamental - https://tanstack.com/query/v4/docs/framework/react/guides/query-keys#query-keys-are-hashed-deterministically
 * @see - https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories
 */

export const authKeys = {
	session: ["session"] as const,
};

export const workspaceKeys = {
	all: ["workspaces"] as const,
	withSlug: (slug: string) => [...workspaceKeys.all, slug] as const,
};

export const memberKeys = {
	all: ["members"] as const,
	activeWithSlug: (slug: string) => [...memberKeys["~active"](), slug] as const,
	"~active": () => [...memberKeys.all, "active"] as const,
};

export const invitationKeys = {
	all: ["invitations"] as const,
	withId: (id: string) => [...invitationKeys.all, id] as const,
};

export const taskKeys = {
	all: ["tasks"] as const,
};

export const walletKeys = {
	all: ["wallets"] as const,
};

export const categoryKeys = {
	all: ["categories"] as const,
};
