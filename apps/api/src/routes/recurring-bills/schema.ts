import { monetary } from "@hoalu/common/monetary";
import {
	ColorSchema,
	CurrencySchema,
	IsoDateSchema,
	RepeatSchema,
	WalletTypeSchema,
} from "@hoalu/common/schema";
import * as z from "zod";

export const RecurringBillSchema = z
	.object({
		id: z.uuidv7(),
		publicId: z.string(),
		title: z.string(),
		description: z.string().nullable(),
		amount: z.coerce.number(),
		currency: CurrencySchema,
		repeat: RepeatSchema,
		anchorDate: z.string(),
		dueDay: z.number().int().nullable(),
		dueMonth: z.number().int().nullable(),
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
	})
	.transform((val) => ({
		...val,
		realAmount: val.amount,
		amount: monetary.fromRealAmount(val.amount, val.currency),
	}));

export const RecurringBillsSchema = z.array(RecurringBillSchema);

export const InsertRecurringBillSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	amount: z.number(),
	currency: CurrencySchema,
	repeat: RepeatSchema,
	// dueDay: day-of-month (1-31) for monthly, day-of-week (0-6) for weekly.
	// For yearly, the full anchorDate is used instead.
	dueDay: z.number().int().min(0).max(31).optional(),
	// dueMonth: month (1-12), only for yearly bills.
	dueMonth: z.number().int().min(1).max(12).optional(),
	// anchorDate: full "yyyy-MM-dd", required for yearly bills to anchor the recurrence year.
	// For monthly/weekly/daily it is derived from dueDay/dueMonth and not user-supplied.
	anchorDate: z.string().optional(),
	walletId: z.uuidv7(),
	categoryId: z.uuidv7().optional(),
	eventId: z.uuidv7().optional(),
	workspaceId: z.uuidv7(),
});

export const UpdateRecurringBillSchema = InsertRecurringBillSchema.omit({
	anchorDate: true,
	workspaceId: true,
}).partial();

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

export const UnifiedBillSchema = z.object({
	recurringBillId: z.uuidv7(),
	date: z.string(), // "yyyy-MM-dd"
	title: z.string(),
	amount: z.number(),
	currency: CurrencySchema,
	repeat: RepeatSchema,
	walletId: z.uuidv7(),
	walletName: z.string(),
	categoryId: z.uuidv7().nullable(),
	categoryName: z.string().nullable(),
	categoryColor: ColorSchema.nullable(),
	isPaid: z.boolean(),
});

export const UnifiedBillsSchema = z.object({
	overdue: z.array(UnifiedBillSchema),
	today: z.array(UnifiedBillSchema),
	upcoming: z.array(UnifiedBillSchema),
});
