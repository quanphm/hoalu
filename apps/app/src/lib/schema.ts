import { type } from "arktype";

export const taskStatusSchema = type("'todo' | 'in-progress' | 'done' | 'canceled' | 'blocked'");
export type TaskType = typeof taskStatusSchema.inferOut;

export const prioritySchema = type("'urgent' | 'high' | 'medium' | 'low' | 'none'");
export type PriorityType = typeof prioritySchema.inferOut;

export const repeatSchema = type("'one-time' | 'weekly' | 'monthly' | 'yearly' | 'custom'");
export type RepeatType = typeof repeatSchema.inferOut;

export const colorSchema = type(
	"'red' | 'green' | 'blue' | 'cyan' | 'yellow' | 'amber' | 'orange' | 'purple' | 'fuchsia' | 'pink' | 'rose' | 'gray' | 'stone' | 'slate' | 'sky'",
);
export type Color = typeof colorSchema.inferOut;

export const walletTypeSchema = type(
	"'cash' | 'bank-account' | 'credit-card' |'debit-card' | 'digital-account'",
);
export type WalletType = typeof walletTypeSchema.inferOut;

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

export const expenseSchema = type({
	id: "string.uuid.v7",
	title: "string",
	description: "string | null",
	amount: "number",
	currency: "string",
	repeat: type("'one-time' | 'weekly' | 'monthly' | 'yearly' | 'custom'"),
	date: "string",
	creator: {
		id: "string.uuid.v7",
		publicId: "string",
		name: "string",
		email: "string.email",
		image: "string | null",
	},
	wallet: {
		id: "string.uuid.v7",
		name: "string",
		description: "string | null",
		currency: "string",
		isActive: "boolean",
	},
	category: {
		id: "string.uuid.v7",
		name: "string",
		description: "string | null",
		color: colorSchema,
	},
	createdAt: "string",
});
export type ExpenseSchema = typeof expenseSchema.infer;

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
	repeat: repeatSchema,
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
	repeat: repeatSchema,
});
export type ExpensePayloadSchema = typeof createExpensePayloadSchema.infer;

export const categorySchema = type({
	id: "string.uuid.v7",
	name: "string",
	description: "string | null",
	color: colorSchema,
});
export type CategorySchema = typeof categorySchema.infer;
