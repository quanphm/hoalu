import type { InferRequestType, InferResponseType } from "hono/client";
import * as z from "zod";

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
export const TaskStatusSchema = z.enum(PG_ENUM_TASK_STATUS);
export const PrioritySchema = z.enum(PG_ENUM_PRIORITY);

export const RepeatSchema = z.enum(PG_ENUM_REPEAT);
export type RepeatSchema = z.infer<typeof RepeatSchema>;

export const WalletTypeSchema = z.enum(PG_ENUM_WALLET_TYPE);
export type WalletTypeSchema = z.infer<typeof WalletTypeSchema>;

export const ColorSchema = z.enum(PG_ENUM_COLOR);
export type ColorSchema = z.infer<typeof ColorSchema>;

/**
 * workspaces
 */
export const WorkspaceFormSchema = z.object({
	name: z.string().min(1),
	slug: z.string().min(1),
	currency: z.string().min(1),
	logo: z.optional(z.string().nullable()),
});
export type WorkspaceFormSchema = z.infer<typeof WorkspaceFormSchema>;
export const WorkspaceMetadataFormSchema = z.object({
	currency: z.string().length(3),
});
export type WorkspaceMetadataFormSchema = z.infer<typeof WorkspaceMetadataFormSchema>;

export const InviteFormSchema = z.object({
	email: z.email(),
});

/**
 * tasks
 */
export type TaskSchema = InferResponseType<typeof honoClient.api.tasks.$get, 200>["data"][number];

/**
 * expenses
 */
export const ExpenseFormSchema = z.object({
	title: z.string().min(1),
	description: z.optional(z.string()),
	transaction: z.object({
		value: z.number(),
		currency: z.string(),
	}),
	date: z.iso.datetime(),
	walletId: z.uuidv7(),
	categoryId: z.uuidv7(),
	repeat: RepeatSchema,
	attachments: z.array(z.file()),
});
export type ExpenseFormSchema = z.infer<typeof ExpenseFormSchema>;
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
export const CategoryFormSchema = z.object({
	name: z.string().min(1),
	description: z.optional(z.string()),
	color: ColorSchema,
});
export type CategoryFormSchema = z.infer<typeof CategoryFormSchema>;
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
export const WalletFormSchema = z.object({
	name: z.string().min(1),
	description: z.optional(z.string()),
	currency: z.string().min(1),
	type: WalletTypeSchema,
	isActive: z.optional(z.boolean()),
});
export type WalletFormSchema = z.infer<typeof WalletFormSchema>;
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
