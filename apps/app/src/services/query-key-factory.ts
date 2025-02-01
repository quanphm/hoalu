/**
 * @see - Fundamental - https://tanstack.com/query/v4/docs/framework/react/guides/query-keys#query-keys-are-hashed-deterministically
 * @see - https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories
 */

export const taskKeys = {
	all: ["tasks"] as const,
};

export const workspaceKeys = {
	all: ["workspaces"] as const,
	withSlug: (slug: string) => [...workspaceKeys.all, slug] as const,
	activeMember: (slug: string) => [...workspaceKeys.all, "active-member", slug] as const,
};

export const memberKeys = {
	all: ["members"] as const,
	active: () => [...memberKeys.all, "active"] as const,
	activeWithSlug: (slug: string) => [...memberKeys.active(), slug] as const,
};

export const invitationKeys = {
	all: ["invitations"] as const,
	withId: (id: string) => [...invitationKeys.all, id] as const,
};
