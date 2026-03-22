import { monetary } from "@hoalu/common/monetary";
import {
	CurrencySchema,
	RepeatSchema,
	IsoDateSchema,
	ColorSchema,
	WalletTypeSchema,
} from "@hoalu/common/schema";
import * as z from "zod";

const BaseIncomeSchema = z.object({
	id: z.uuidv7(),
	title: z.string(),
	description: z.string().nullable(),
	amount: z.coerce.number(),
	currency: CurrencySchema,
	repeat: RepeatSchema,
	date: IsoDateSchema,
	createdAt: IsoDateSchema,
	updatedAt: IsoDateSchema,
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

export const IncomeSchema = BaseIncomeSchema.transform((val) => ({
	...val,
	realAmount: val.amount,
	amount: monetary.fromRealAmount(val.amount, val.currency),
}));

export const IncomesSchema = z.array(IncomeSchema);

export const LiteIncomeSchema = BaseIncomeSchema.pick({
	id: true,
	title: true,
	description: true,
	amount: true,
	currency: true,
	repeat: true,
	date: true,
	wallet: true,
	category: true,
	creator: true,
}).transform((val) => ({
	...val,
	realAmount: val.amount,
	amount: monetary.fromRealAmount(val.amount, val.currency),
}));

export const DeleteIncomeSchema = z.object({
	id: z.uuidv7(),
});

export const InsertIncomeSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	date: z.optional(z.iso.datetime()),
	currency: CurrencySchema,
	repeat: RepeatSchema.default("one-time"),
	amount: z.coerce.number(),
	walletId: z.uuidv7(),
	categoryId: z.uuidv7().optional(),
});

export const UpdateIncomeSchema = z
	.object({
		title: z.string().min(1),
		description: z.string(),
		date: z.optional(z.iso.datetime()),
		currency: CurrencySchema,
		repeat: RepeatSchema.default("one-time"),
		amount: z.number(),
		walletId: z.uuidv7(),
		categoryId: z.uuidv7(),
	})
	.partial();
