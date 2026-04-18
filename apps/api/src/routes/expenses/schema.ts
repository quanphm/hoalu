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
	recurringBillId: z.uuidv7().optional(),
	eventId: z.uuidv7().optional(),
});

export const UpdateExpenseSchema = z
	.object({
		title: z.string().min(1),
		description: z.string(),
		amount: z.number(),
		currency: CurrencySchema,
		repeat: RepeatSchema,
		date: z.iso.datetime(),
		walletId: z.uuidv7(),
		categoryId: z.uuidv7(),
		// Allow explicitly unlinking (set to null) or linking to a bill
		recurringBillId: z.uuidv7().nullable(),
		// Allow explicitly unlinking (set to null) or linking to an event
		eventId: z.uuidv7().nullable(),
	})
	.partial();

export const DeleteExpenseSchema = z.object({
	id: z.uuidv7(),
	txid: z.coerce.number(),
});

export const LiteExpenseSchema = BaseExpenseSchema.pick({
	id: true,
	title: true,
	description: true,
	amount: true,
	currency: true,
	repeat: true,
	date: true,
})
	.extend({
		txid: z.coerce.number(),
	})
	.transform((val) => ({
		...val,
		realAmount: val.amount,
		amount: monetary.fromRealAmount(val.amount, val.currency),
	}));

export const QuickEntryParseSchema = z.object({
	text: z.string().min(1).describe("Natural language expense description"),
});

export const QuickEntryResultSchema = z.object({
	title: z.string(),
	amount: z.number(),
	currency: CurrencySchema,
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	suggestedCategoryId: z.uuidv7().nullable(),
	suggestedWalletId: z.uuidv7().nullable(),
	repeat: RepeatSchema,
	confidence: z.number().min(0).max(1),
});

export type QuickEntryParseSchema = z.infer<typeof QuickEntryParseSchema>;
export type QuickEntryResultSchema = z.infer<typeof QuickEntryResultSchema>;
