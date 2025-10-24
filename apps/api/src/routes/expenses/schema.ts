import * as z from "zod";

import { monetary } from "#api/common/monetary.ts";
import {
	ColorSchema,
	CurrencySchema,
	IsoDateSchema,
	RepeatSchema,
	WalletTypeSchema,
} from "#api/common/schema.ts";

export const ExpenseSchema = z
	.object({
		id: z.uuidv7(),
		title: z.string(),
		description: z.string().nullable(),
		amount: z.coerce.number(),
		currency: z.string(),
		repeat: RepeatSchema,
		date: IsoDateSchema,
		createdAt: IsoDateSchema,
		creator: z.object({
			id: z.uuidv7(),
			publicId: z.string(),
			name: z.string(),
			email: z.email(),
			image: z.string().nullable(),
		}),
		wallet: z.object({
			id: z.uuidv7(),
			name: z.string(),
			description: z.string().nullable(),
			currency: z.string(),
			type: WalletTypeSchema,
			isActive: z.boolean(),
		}),
		category: z
			.object({
				id: z.uuidv7(),
				name: z.string(),
				description: z.string().nullable(),
				color: ColorSchema,
			})
			.nullable(),
	})
	.transform((val) => ({
		...val,
		amount: monetary.fromRealAmount(val.amount, val.currency),
		realAmount: val.amount,
	}));

export const ExpensesSchema = z.array(ExpenseSchema);

export const InsertExpenseSchema = z.object({
	title: z.string().min(1),
	description: z.optional(z.string()),
	amount: z.number(),
	currency: CurrencySchema,
	repeat: RepeatSchema.default("one-time"),
	date: z.optional(z.iso.datetime()),
	walletId: z.uuidv7(),
	categoryId: z.uuidv7(),
});

export const UpdateExpenseSchema = InsertExpenseSchema.partial();

export const DeleteExpenseSchema = z.object({
	id: z.uuidv7(),
});

export const LiteExpenseSchema = z
	.object({
		id: z.uuidv7(),
		title: z.string(),
		description: z.string().nullable(),
		amount: z.coerce.number(),
		currency: z.string(),
		repeat: RepeatSchema,
		date: IsoDateSchema,
	})
	.transform((val) => ({
		...val,
		amount: monetary.fromRealAmount(val.amount, val.currency),
		realAmount: val.amount,
	}));
