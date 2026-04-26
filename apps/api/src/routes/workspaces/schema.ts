import * as z from "zod";

export const WorkspaceSummarySchema = z.object({
	id: z.uuidv7(),
	slug: z.string(),
	name: z.string(),
	logo: z.string().nullable(),
	totalExpensesThisMonth: z.number(),
	totalExpensesLastMonth: z.number(),
	totalIncomeThisMonth: z.number(),
	totalIncomeLastMonth: z.number(),
	activeWalletsCount: z.number(),
	trendPercentage: z.number(),
	lastActivityAt: z.string().nullable(),
	primaryCurrency: z.string().length(3),
});

export type WorkspaceSummary = z.infer<typeof WorkspaceSummarySchema>;

export const WorkspaceSummariesSchema = z.array(WorkspaceSummarySchema);
