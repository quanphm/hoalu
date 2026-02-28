import { ColorSchema, CurrencySchema, IsoDateSchema, RepeatSchema, WalletTypeSchema } from "@hoalu/common/schema";
import * as z from "zod";

export const RecurringBillSchema = z.object({
	id: z.uuidv7(),
	title: z.string(),
	description: z.string().nullable(),
	amount: z.coerce.number(),
	currency: CurrencySchema,
	repeat: RepeatSchema,
	anchorDate: z.string(),
	isActive: z.boolean(),
	wallet: z.object({
		id: z.uuidv7(),
		name: z.string(),
		currency: CurrencySchema,
		type: WalletTypeSchema,
	}),
	category: z
		.object({
			id: z.uuidv7(),
			name: z.string(),
			color: ColorSchema,
		})
		.nullable(),
	createdAt: IsoDateSchema,
	updatedAt: IsoDateSchema,
});

export const RecurringBillsSchema = z.array(RecurringBillSchema);

export const InsertRecurringBillSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	amount: z.number(),
	currency: CurrencySchema,
	repeat: RepeatSchema,
	anchorDate: z.string(),
	walletId: z.uuidv7(),
	categoryId: z.uuidv7().optional(),
	workspaceId: z.uuidv7(),
});

export const UpdateRecurringBillSchema = InsertRecurringBillSchema.partial();

export const UpcomingBillSchema = z.object({
	recurringBillId: z.uuidv7(),
	date: z.string(), // "yyyy-MM-dd"
	title: z.string(),
	amount: z.coerce.number(),
	currency: CurrencySchema,
	repeat: RepeatSchema,
	walletId: z.uuidv7(),
	walletName: z.string(),
	categoryId: z.uuidv7().nullable(),
	categoryName: z.string().nullable(),
	categoryColor: ColorSchema.nullable(),
});

export const UpcomingBillsSchema = z.array(UpcomingBillSchema);
