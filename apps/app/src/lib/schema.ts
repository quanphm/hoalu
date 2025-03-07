import { type } from "arktype";

export const workspaceFormSchema = type({
	name: "string > 0",
	slug: "string > 0",
});
export type WorkspaceFormSchema = typeof workspaceFormSchema.infer;

export const deleteWorkspaceFormSchema = type({
	confirm: "string > 0",
});

export const inviteFormSchema = type({
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
export type TaskSchema = typeof taskSchema.infer;

export const createExpenseFormSchema = type({
	title: "string > 0",
	"description?": "string",
	transaction: {
		value: "number",
		currency: "string",
	},
	date: "Date",
	walletId: "string.uuid.v7",
	categoryId: "string.uuid.v7",
	repeat: type("'one-time' | 'weekly' | 'monthly' | 'yearly' | 'custom'"),
});
export type ExpenseFormSchema = typeof createExpenseFormSchema.infer;
export const createExpensePayloadSchema = type({
	title: "string > 0",
	"description?": "string",
	amount: "number",
	currency: "string = 'USD'",
	date: "string",
	walletId: "string.uuid.v7",
	categoryId: "string.uuid.v7",
	repeat: type("'one-time' | 'weekly' | 'monthly' | 'yearly' | 'custom'"),
});
export type ExpensePayloadSchema = typeof createExpensePayloadSchema.infer;
