import { type } from "arktype";
import type { InferRequestType, InferResponseType } from "hono/client";

import {
	PG_ENUM_COLOR,
	PG_ENUM_PRIORITY,
	PG_ENUM_REPEAT,
	PG_ENUM_TASK_STATUS,
	PG_ENUM_WALLET_TYPE,
} from "@hoalu/common/enums";
import type { honoClient } from "@/lib/api-client";

/**
 * enums
 */
export const TaskStatusSchema = type("===", ...PG_ENUM_TASK_STATUS);
export const PrioritySchema = type("===", ...PG_ENUM_PRIORITY);

export const RepeatSchema = type("===", ...PG_ENUM_REPEAT);
export type RepeatSchema = typeof RepeatSchema.infer;

export const WalletTypeSchema = type("===", ...PG_ENUM_WALLET_TYPE);
export type WalletTypeSchema = typeof WalletTypeSchema.inferOut;

export const ColorSchema = type("===", ...PG_ENUM_COLOR);
export type ColorSchema = typeof ColorSchema.inferOut;

/**
 * workspaces
 */
export const WorkspaceFormSchema = type({
	name: "string > 0",
	slug: "string > 0",
	currency: "string > 0",
	"logo?": "string | null",
});
export type WorkspaceFormSchema = typeof WorkspaceFormSchema.infer;
export const WorkspaceMetadataFormSchema = type({
	currency: "string > 0",
});
export type WorkspaceMetadataFormSchema = typeof WorkspaceMetadataFormSchema.infer;

export const InviteFormSchema = type({
	email: "string.email",
});

/**
 * tasks
 */
export type TaskSchema = InferResponseType<typeof honoClient.api.tasks.$get, 200>["data"][number];

/**
 * expenses
 */
export const ExpenseFormSchema = type({
	title: "string > 0",
	"description?": "string",
	transaction: {
		value: "number",
		currency: "string",
	},
	date: "string.date.iso",
	walletId: "string.uuid.v7",
	categoryId: "string.uuid.v7",
	repeat: RepeatSchema,
	attachments: type("File").array(),
});
export type ExpenseFormSchema = typeof ExpenseFormSchema.infer;
export type ExpenseSchema = InferResponseType<
	typeof honoClient.api.expenses.$get,
	200
>["data"][number];
export type ExpenseWithClientConvertedSchema = ExpenseSchema & {
	convertedAmount: number;
};
export type ExpensePostSchema = InferRequestType<typeof honoClient.api.expenses.$post>["json"];
export type ExpensePatchSchema = InferRequestType<
	(typeof honoClient.api.expenses)[":id"]["$patch"]
>["json"];

/**
 * categories
 */
export const CategoryFormSchema = type({
	name: "string > 0",
	"description?": "string",
	color: ColorSchema,
});
export type CategoryFormSchema = typeof CategoryFormSchema.infer;
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
export const WalletFormSchema = type({
	name: "string > 0",
	"description?": "string",
	currency: "string > 0",
	type: WalletTypeSchema,
	"isActive?": "boolean",
});
export type WalletFormSchema = typeof WalletFormSchema.infer;
export type WalletSchema = InferResponseType<
	typeof honoClient.api.wallets.$get,
	200
>["data"][number];
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

/**
 * files
 */
export type FileMetaSchema = InferRequestType<
	(typeof honoClient.api.files)["generate-upload-url"]["$post"]
>["json"];
