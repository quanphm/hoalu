import {
	PG_ENUM_COLOR,
	PG_ENUM_PRIORITY,
	PG_ENUM_REPEAT,
	PG_ENUM_TASK_STATUS,
	PG_ENUM_WALLET_TYPE,
} from "@hoalu/common/enums";
import { type } from "arktype";

/**
 * enums
 */
export const taskStatusSchema = type("===", ...PG_ENUM_TASK_STATUS);
export const prioritySchema = type("===", ...PG_ENUM_PRIORITY);
export const repeatSchema = type("===", ...PG_ENUM_REPEAT);
export const walletTypeSchema = type("===", ...PG_ENUM_WALLET_TYPE);
export const colorSchema = type("===", ...PG_ENUM_COLOR);
export type Color = typeof colorSchema.inferOut;

/**
 * workspace
 */
export const workspaceFormSchema = type({
	name: "string > 0",
	slug: "string > 0",
	currency: "string > 0",
});
export type WorkspaceFormSchema = typeof workspaceFormSchema.infer;

export const workspaceMetadataFormSchema = type({
	currency: "string > 0",
});
export type WorkspaceMetadataFormSchema = typeof workspaceMetadataFormSchema.infer;

export const inviteFormSchema = type({
	email: "string.email",
});

/**
 * tasks
 */
export const taskSchema = type({
	id: "string",
	title: "string > 0",
	description: "string | null",
	status: taskStatusSchema,
	priority: prioritySchema,
	dueDate: "string",
});
export type TaskSchema = typeof taskSchema.infer;

/**
 * expenses
 */
export const expenseSchema = type({
	id: "string.uuid.v7",
	title: "string",
	description: "string | null",
	amount: "number",
	realAmount: "number",
	currency: "string",
	repeat: repeatSchema,
	date: "string",
	createdAt: "string",
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

export const expensePayloadSchema = type({
	title: "string > 0",
	"description?": "string",
	amount: "number",
	currency: "string = 'USD'",
	date: "string",
	walletId: "string.uuid.v7",
	categoryId: "string.uuid.v7",
	repeat: repeatSchema,
});
export type ExpensePayloadSchema = typeof expensePayloadSchema.infer;

/**
 * categories
 */
export const categorySchema = type({
	id: "string.uuid.v7",
	name: "string",
	description: "string | null",
	color: colorSchema,
});
export type CategorySchema = typeof categorySchema.infer;

/**
 * wallets
 */
export const walletFormSchema = type({
	name: "string > 0",
	"description?": "string",
	currency: "string > 0",
	type: walletTypeSchema,
	"isActive?": "boolean",
});
export type WalletFormSchema = typeof walletFormSchema.infer;

export const walletPayloadSchema = type({
	name: "string > 0",
	"description?": "string",
	currency: "string = 'USD'",
	type: walletTypeSchema,
	"isActive?": "boolean",
});
export type WalletPayloadSchema = typeof walletPayloadSchema.infer;

/**
 * exchange-rates
 */
export const exchangeRatesPayloadSchema = type({
	"from?": "string",
	to: "string > 0",
});
export type ExchangeRatesPayloadSchema = typeof exchangeRatesPayloadSchema.infer;
