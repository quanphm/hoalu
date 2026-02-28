import { monetary } from "@hoalu/common/monetary";
import {
	ColorSchema,
	CurrencySchema,
	IsoDateSchema,
	RepeatSchema,
	WalletTypeSchema,
} from "@hoalu/common/schema";
import * as z from "zod";

const BaseExpenseSchema = z.object({
	id: z.uuidv7(),
	title: z.string(),
	description: z.string().nullable(),
	amount: z.coerce.number(),
	currency: CurrencySchema,
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
		currency: CurrencySchema,
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
});

export const ExpenseSchema = BaseExpenseSchema.transform((val) => ({
	...val,
	realAmount: val.amount,
	amount: monetary.fromRealAmount(val.amount, val.currency),
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
	// When provided, the expense is linked to this existing recurring bill
	// and the bill's anchor_date is advanced by one period.
	recurringBillId: z.uuidv7().optional(),
});

export const UpdateExpenseSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().optional(),
	amount: z.number().optional(),
	currency: CurrencySchema.optional(),
	// No .default() here — omitting repeat in a PATCH must not overwrite the DB value
	repeat: RepeatSchema.optional(),
	date: z.iso.datetime().optional(),
	walletId: z.uuidv7().optional(),
	categoryId: z.uuidv7().optional(),
	// Allow explicitly unlinking (set to null) or linking to a bill
	recurringBillId: z.uuidv7().nullable().optional(),
});

export const DeleteExpenseSchema = z.object({
	id: z.uuidv7(),
});

export const LiteExpenseSchema = BaseExpenseSchema.pick({
	id: true,
	title: true,
	description: true,
	amount: true,
	currency: true,
	repeat: true,
	date: true,
}).transform((val) => ({
	...val,
	realAmount: val.amount,
	amount: monetary.fromRealAmount(val.amount, val.currency),
}));
