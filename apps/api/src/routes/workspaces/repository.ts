import { db, schema } from "#api/db/index.ts";
import { ExchangeRateRepository } from "#api/routes/exchange-rates/repository.ts";
import { monetary } from "@hoalu/common/monetary";
import { and, count, eq, gte, sql } from "drizzle-orm";

export class WorkspaceRepository {
	private exchangeRateRepo = new ExchangeRateRepository();

	/**
	 * Determine the workspace's primary currency
	 * Based on the currency of the wallet with the most expenses
	 */
	private async getPrimaryCurrency(workspaceId: string): Promise<string> {
		const [primaryWallet] = await db
			.select({
				currency: schema.wallet.currency,
				expenseCount: count(schema.expense.id),
			})
			.from(schema.wallet)
			.leftJoin(schema.expense, eq(schema.expense.walletId, schema.wallet.id))
			.where(eq(schema.wallet.workspaceId, workspaceId))
			.groupBy(schema.wallet.currency)
			.orderBy(sql`COUNT(${schema.expense.id}) DESC`)
			.limit(1);

		return primaryWallet?.currency || "USD";
	}

	/**
	 * Convert expenses to target currency and sum them
	 * Handles minor units conversion and exchange rates
	 *
	 * @param expenses - Array of expenses with amount, currency, and date
	 * @param targetCurrency - Currency to convert all expenses to
	 * @param conversionDate - Date to use for exchange rate lookup (typically month-end)
	 * @returns Total in minor units of target currency + flag for missing rates
	 */
	private async convertAndSumExpenses(
		expenses: Array<{ amount: string; currency: string; date: string }>,
		targetCurrency: string,
		conversionDate: string,
	): Promise<{ total: number; hasMissingRates: boolean }> {
		if (expenses.length === 0) {
			return { total: 0, hasMissingRates: false };
		}

		let totalInMinorUnits = 0;
		let hasMissingRates = false;

		// Get unique currencies and fetch rates upfront for better performance
		const uniqueCurrencies = [...new Set(expenses.map((e) => e.currency))];
		const rates = new Map<string, number>();

		// Batch fetch all exchange rates
		for (const currency of uniqueCurrencies) {
			if (currency !== targetCurrency) {
				const rate = await this.exchangeRateRepo.lookup([currency, targetCurrency], conversionDate);
				if (rate) {
					rates.set(currency, Number.parseFloat(rate.exchangeRate));
				} else {
					hasMissingRates = true;
					console.warn(
						`[WorkspaceRepository] Missing exchange rate: ${currency} → ${targetCurrency} on ${conversionDate}`,
					);
				}
			}
		}

		// Process each expense
		for (const expense of expenses) {
			const amountInMinorUnits = Number.parseFloat(expense.amount);

			// Step 1: Convert from minor units to real amount
			const realAmount = monetary.fromRealAmount(amountInMinorUnits, expense.currency);

			// Step 2: Apply currency conversion if needed
			let convertedRealAmount = realAmount;
			if (expense.currency !== targetCurrency) {
				const rate = rates.get(expense.currency);
				if (rate) {
					convertedRealAmount = realAmount * rate;
				} else {
					// Skip this expense if no rate available
					continue;
				}
			}

			// Step 3: Convert back to minor units in target currency
			const convertedMinorUnits = monetary.toRealAmount(convertedRealAmount, targetCurrency);

			totalInMinorUnits += convertedMinorUnits;
		}

		return {
			total: Math.round(totalInMinorUnits),
			hasMissingRates,
		};
	}

	/**
	 * Get workspace summary with financial metrics
	 * Includes: total expenses this/last month, transaction count, active wallets, trend
	 * All monetary values are converted to the workspace's primary currency
	 */
	async getWorkspaceSummary(param: { workspaceId: string; userId: string }) {
		// Verify user has access to workspace
		const [workspaceData] = await db
			.select()
			.from(schema.workspace)
			.innerJoin(schema.member, eq(schema.workspace.id, schema.member.workspaceId))
			.where(
				and(eq(schema.workspace.id, param.workspaceId), eq(schema.member.userId, param.userId)),
			)
			.limit(1);

		if (!workspaceData) return null;

		const workspace = workspaceData.workspace;

		// STEP 1: Determine primary currency FIRST (most important!)
		const primaryCurrency = await this.getPrimaryCurrency(param.workspaceId);

		// Calculate date ranges
		const now = new Date();
		const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const thisMonthEnd = now;
		const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

		// STEP 2: Fetch expenses for this month with currency information
		const thisMonthExpenses = await db
			.select({
				amount: schema.expense.amount,
				currency: schema.expense.currency,
				date: schema.expense.date,
			})
			.from(schema.expense)
			.where(
				and(
					eq(schema.expense.workspaceId, param.workspaceId),
					gte(schema.expense.date, thisMonthStart.toISOString()),
				),
			);

		// STEP 3: Convert and sum expenses with proper currency handling
		const { total: totalExpensesThisMonth, hasMissingRates: thisMonthMissingRates } =
			await this.convertAndSumExpenses(
				thisMonthExpenses,
				primaryCurrency,
				thisMonthEnd.toISOString(),
			);

		const transactionCount = thisMonthExpenses.length;

		// STEP 4: Fetch and convert last month's expenses
		const lastMonthExpenses = await db
			.select({
				amount: schema.expense.amount,
				currency: schema.expense.currency,
				date: schema.expense.date,
			})
			.from(schema.expense)
			.where(
				and(
					eq(schema.expense.workspaceId, param.workspaceId),
					gte(schema.expense.date, lastMonthStart.toISOString()),
					sql`${schema.expense.date} < ${lastMonthEnd.toISOString()}`,
				),
			);

		const { total: totalExpensesLastMonth, hasMissingRates: lastMonthMissingRates } =
			await this.convertAndSumExpenses(
				lastMonthExpenses,
				primaryCurrency,
				lastMonthEnd.toISOString(),
			);

		// Get active wallets count
		const [walletsData] = await db
			.select({ count: count() })
			.from(schema.wallet)
			.where(
				and(eq(schema.wallet.workspaceId, param.workspaceId), eq(schema.wallet.isActive, true)),
			);

		const [lastActivity] = await db
			.select({ date: schema.expense.date })
			.from(schema.expense)
			.where(eq(schema.expense.workspaceId, param.workspaceId))
			.orderBy(sql`${schema.expense.date} DESC`)
			.limit(1);

		// Calculate trend percentage
		let trendPercentage = 0;
		if (totalExpensesLastMonth > 0) {
			trendPercentage =
				((totalExpensesThisMonth - totalExpensesLastMonth) / totalExpensesLastMonth) * 100;
		} else if (totalExpensesThisMonth > 0) {
			trendPercentage = 100; // If no expenses last month but have this month
		}

		const hasMissingRates = thisMonthMissingRates || lastMonthMissingRates;

		return {
			id: workspace.id,
			slug: workspace.slug,
			name: workspace.name,
			logo: workspace.logo,
			totalExpensesThisMonth,
			totalExpensesLastMonth,
			transactionCount,
			activeWalletsCount: walletsData.count,
			trendPercentage: Math.round(trendPercentage * 100) / 100,
			lastActivityAt: lastActivity?.date || null,
			primaryCurrency,
			hasMissingRates: hasMissingRates || undefined,
		};
	}

	/**
	 * Get summaries for all user's workspaces
	 */
	async getAllWorkspaceSummaries(param: { userId: string }) {
		// Get all workspaces user is a member of
		const workspaces = await db
			.select({ workspaceId: schema.member.workspaceId })
			.from(schema.member)
			.where(eq(schema.member.userId, param.userId));

		// Get summary for each workspace
		const summaries = await Promise.all(
			workspaces.map(async (ws) => {
				return this.getWorkspaceSummary({
					workspaceId: ws.workspaceId,
					userId: param.userId,
				});
			}),
		);

		// Filter out null results
		return summaries.filter((s) => s !== null);
	}
}
