import * as z from "zod";

/**
 * All-time flow for one wallet in one currency, in minor units.
 *
 * Grouped by currency as well as wallet on purpose: a wallet's transactions may
 * be recorded in a currency other than the wallet's own, and converting them
 * here would need a per-transaction exchange rate. Keeping the recorded currency
 * is both cheaper and true — the client decides what to compare.
 */
export const WalletNetSchema = z.object({
	walletId: z.uuidv7(),
	walletName: z.string(),
	currency: z.string().length(3),
	isActive: z.boolean(),
	/** Minor units, in this entry's currency. */
	inAmount: z.number(),
	outAmount: z.number(),
	netAmount: z.number(),
});

/**
 * Unpaid occurrences for a workspace, counted from the shared bill projection.
 * `next` is the earliest-due unpaid occurrence — an overdue bill outranks a
 * future one, which is what makes this useful on a home page.
 */
export const BillsDueSchema = z.object({
	overdue: z.number().int(),
	dueToday: z.number().int(),
	upcoming: z.number().int(),
	next: z
		.object({
			title: z.string(),
			dueDate: z.string(),
			/** Minor units, in the bill's own currency. */
			amount: z.number(),
			currency: z.string().length(3),
		})
		.nullable(),
	/** Bill ids the projection cannot schedule (`repeat: "custom"` or malformed). */
	unsupported: z.array(z.string()),
});

/**
 * Spend so far this month against the *same stretch* of the previous month.
 * Comparing a partial month to a complete one flatters every mid-month reading,
 * so the previous window is clamped to the same day-of-month.
 */
export const SpendComparisonSchema = z.object({
	currentWindow: z.object({ from: z.string(), to: z.string() }),
	previousWindow: z.object({ from: z.string(), to: z.string() }),
	currentAmount: z.number(),
	previousAmount: z.number(),
	/** Percent change; `null` when the previous window had no spend to compare against. */
	changePercentage: z.number().nullable(),
});

export const WorkspaceSummarySchema = z.object({
	id: z.uuidv7(),
	slug: z.string(),
	name: z.string(),
	logo: z.string().nullable(),
	/** Currency the workspace's wallets are most often used in — the conversion target for `spend`. */
	primaryCurrency: z.string().length(3),
	activeWalletsCount: z.number().int(),
	lastActivityAt: z.string().nullable(),
	spend: SpendComparisonSchema,
	walletNets: z.array(WalletNetSchema),
	bills: BillsDueSchema,
});

export type WorkspaceSummary = z.infer<typeof WorkspaceSummarySchema>;

export const WorkspaceSummariesSchema = z.array(WorkspaceSummarySchema);
