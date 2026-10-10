import { monetary } from "@hoalu/finance/monetary";
import {
	ColorSchema,
	CurrencySchema,
	IsoDateSchema,
	RepeatSchema,
	WalletTypeSchema,
} from "@hoalu/schema/schema";
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
	// `null` means "unset" for these optional relations, and the client sends exactly
	// that (to create a bill with no category, or to clear one on edit). `undefined`
	// cannot express it: an omitted key on PATCH leaves the previous value in place.
	categoryId: z.uuidv7().nullable().optional(),
	eventId: z.uuidv7().nullable().optional(),
	workspaceId: z.uuidv7(),
});

export const UpdateRecurringBillSchema = InsertRecurringBillSchema.omit({
	anchorDate: true,
	workspaceId: true,
}).partial();

/**
 * A projected occurrence, joined to the bill's display data.
 *
 * `period` is the occurrence's stable identity (e.g. `"2026-09"`); `date` is the
 * due date rendered under the bill's current definition and may move when the
 * bill is edited. An occurrence with a payment against it is not projected at
 * all, so there is no `isPaid` field.
 */
const ProjectedBillSchema = z.object({
	recurringBillId: z.uuidv7(),
	date: z.string(), // "yyyy-MM-dd"
	period: z.string(),
	daysUntil: z.number(),
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

export const ProjectedBillsSchema = z.array(ProjectedBillSchema);

export const UnifiedBillsSchema = z.object({
	overdue: ProjectedBillsSchema,
	today: ProjectedBillsSchema,
	upcoming: ProjectedBillsSchema,
	/** Payments that landed on no scheduled occurrence, or double-paid one period. */
	anomalies: z.array(
		z.object({
			kind: z.string(),
			recurringBillId: z.uuidv7(),
			period: z.string(),
			expenseIds: z.array(z.uuidv7()),
		}),
	),
	/** Bill ids the projection cannot schedule (`repeat: "custom"` or malformed dates). */
	unsupported: z.array(z.string()),
});
