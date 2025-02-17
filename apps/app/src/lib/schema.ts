import { type } from "arktype";

export const workspaceSchema = type({
	name: "string > 0",
	slug: "string > 0",
});

export const deleteWorkspaceSchema = type({
	confirm: "string > 0",
});

export const inviteSchema = type({
	email: "string.email",
});

export const taskSchema = type({
	id: "string",
	name: "string > 0",
	done: "boolean",
});
