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
	title: "string > 0",
	description: "string | null",
	status: "'todo' | 'in-progress' | 'done' | 'blocked' | 'canceled'",
	priority: "'urgent' | 'high' | 'medium' | 'low' | 'none'",
	dueDate: "string",
});
