import type { honoClient } from "@/lib/api-client";
import {
	PG_ENUM_COLOR,
	PG_ENUM_PRIORITY,
	PG_ENUM_REPEAT,
	PG_ENUM_TASK_STATUS,
	PG_ENUM_WALLET_TYPE,
} from "@hoalu/common/enums";
import { type } from "arktype";
import type { InferRequestType, InferResponseType } from "hono/client";

/**
 * enums
 */
export const taskStatusSchema = type("===", ...PG_ENUM_TASK_STATUS);
export const prioritySchema = type("===", ...PG_ENUM_PRIORITY);
export const repeatSchema = type("===", ...PG_ENUM_REPEAT);

export const walletTypeSchema = type("===", ...PG_ENUM_WALLET_TYPE);
export type WalletType = typeof walletTypeSchema.inferOut;

export const colorSchema = type("===", ...PG_ENUM_COLOR);
export type Color = typeof colorSchema.inferOut;

/**
 * workspaces
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
export type TaskSchema = InferResponseType<typeof honoClient.api.tasks.$get, 200>["data"][number];

/**
 * expenses
 */
export const expenseFormSchema = type({
	title: "string > 0",
	"description?": "string",
	transaction: {
		value: "number",
		currency: "string",
	},
	date: "string.date.iso",
	walletId: "string.uuid.v7",
	categoryId: "string.uuid.v7",
	repeat: repeatSchema,
});
export type ExpenseFormSchema = typeof expenseFormSchema.infer;
export type ExpenseSchema = InferResponseType<
	typeof honoClient.api.expenses.$get,
	200
>["data"][number];
export type ExpensePostSchema = InferRequestType<typeof honoClient.api.expenses.$post>["json"];
export type ExpensePatchSchema = InferRequestType<
	(typeof honoClient.api.expenses)[":id"]["$patch"]
>["json"];

/**
 * categories
 */
export const categoryFormSchema = type({
	name: "string > 0",
	"description?": "string",
	color: colorSchema,
});
export type CategoryFormSchema = typeof categoryFormSchema.infer;
export type CategorySchema = InferResponseType<
	typeof honoClient.api.categories.$get,
	200
>["data"][number];
export type CategoryPostSchema = InferRequestType<typeof honoClient.api.categories.$post>["json"];
export type CategoryPatchSchema = InferRequestType<
	(typeof honoClient.api.categories)[":id"]["$patch"]
>["json"];

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
export type WalletPostSchema = InferRequestType<typeof honoClient.api.wallets.$post>["json"];
export type WalletPatchSchema = InferRequestType<
	(typeof honoClient.api.wallets)[":id"]["$patch"]
>["json"];

/**
 * exchange-rates
 */
export type ExchangeRatesQuerySchema = InferRequestType<
	(typeof honoClient.api)["exchange-rates"]["$get"]
>["query"];
