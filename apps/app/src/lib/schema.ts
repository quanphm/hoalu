import type { honoClient } from "#app/lib/api-client.ts";
import { ColorSchema, CurrencySchema, RepeatSchema, WalletTypeSchema } from "@hoalu/common/schema";
import type { InferRequestType, InferResponseType } from "hono/client";
import * as z from "zod";

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
export type TaskSchema = InferResponseType<typeof honoClient.bff.tasks.$get, 200>["data"][number];

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
	recurringBillId: z.string().optional(),
	attachments: z.array(z.file()),
});
export type ExpenseFormSchema = z.infer<typeof ExpenseFormSchema>;
export type ExpenseSchema = InferResponseType<
	typeof honoClient.bff.expenses.$get,
	200
>["data"][number];
export type ExpenseWithClientConvertedSchema = ExpenseSchema & {
	convertedAmount: number;
};
export type ExpensePostSchema = InferRequestType<typeof honoClient.bff.expenses.$post>["json"];
export type ExpensePatchSchema = InferRequestType<
	(typeof honoClient.bff.expenses)[":id"]["$patch"]
>["json"];

/**
 * incomes
 */
export const IncomeFormSchema = z.object({
	title: z.string().min(1),
	description: z.optional(z.string()),
	transaction: z.object({
		value: z.number().positive(),
		currency: z.string(),
	}),
	date: z.iso.datetime(),
	walletId: z.uuidv7(),
	categoryId: z.uuidv7().optional(),
});
export type IncomeFormSchema = z.infer<typeof IncomeFormSchema>;
export type IncomeSchema = InferResponseType<
	typeof honoClient.bff.incomes.$get,
	200
>["data"][number];
export type IncomePostSchema = InferRequestType<typeof honoClient.bff.incomes.$post>["json"];
export type IncomePatchSchema = InferRequestType<
	(typeof honoClient.bff.incomes)[":id"]["$patch"]
>["json"];

/**
 * categories
 */
export const CategoryFormSchema = z.object({
	name: z.string().min(1),
	description: z.optional(z.string()),
	color: ColorSchema,
	type: z.enum(["expense", "income"]),
});
export type CategoryFormSchema = z.infer<typeof CategoryFormSchema>;
export type CategorySchema = InferResponseType<
	typeof honoClient.bff.categories.$get,
	200
>["data"][number];
export type CategoryPostSchema = InferRequestType<typeof honoClient.bff.categories.$post>["json"];
export type CategoryPatchSchema = InferRequestType<
	(typeof honoClient.bff.categories)[":id"]["$patch"]
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
	typeof honoClient.bff.wallets.$get,
	200
>["data"][number];
export type WalletPostSchema = InferRequestType<typeof honoClient.bff.wallets.$post>["json"];
export type WalletPatchSchema = InferRequestType<
	(typeof honoClient.bff.wallets)[":id"]["$patch"]
>["json"];

/**
 * exchange-rates
 */
export type ExchangeRatesQuerySchema = InferRequestType<
	(typeof honoClient.bff)["exchange-rates"]["$get"]
>["query"];

/**
 * files
 */
export type FileMetaSchema = InferRequestType<
	(typeof honoClient.bff.files)["generate-upload-url"]["$post"]
>["json"];

/**
 * quick entry
 */
export const QuickEntryResultSchema = z.object({
	title: z.string(),
	amount: z.number(),
	currency: CurrencySchema,
	date: z.string(),
	suggestedCategoryId: z.string().nullable(),
	repeat: RepeatSchema,
	confidence: z.number(),
});
export type QuickEntryResultSchema = z.infer<typeof QuickEntryResultSchema>;
