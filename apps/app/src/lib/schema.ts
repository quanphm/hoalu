import {
	PG_ENUM_COLOR,
	PG_ENUM_PRIORITY,
	PG_ENUM_REPEAT,
	PG_ENUM_TASK_STATUS,
	PG_ENUM_WALLET_TYPE,
} from "@hoalu/common/enums";
import { type } from "arktype";

export const taskStatusSchema = type("===", ...PG_ENUM_TASK_STATUS);
export const prioritySchema = type("===", ...PG_ENUM_PRIORITY);
export const repeatSchema = type("===", ...PG_ENUM_REPEAT);
export const walletTypeSchema = type("===", ...PG_ENUM_WALLET_TYPE);

export const colorSchema = type("===", ...PG_ENUM_COLOR);
export type Color = typeof colorSchema.inferOut;

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

export const expenseFormSchema = type({
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
export type ExpenseFormSchema = typeof expenseFormSchema.infer;

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
