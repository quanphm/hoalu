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
	private async convertAndSum(
		rows: Array<{ amount: string; currency: string; date: string }>,
		targetCurrency: string,
		conversionDate: string,
	): Promise<number> {
		if (rows.length === 0) return 0;

		let totalInMinorUnits = 0;

		const uniqueCurrencies = [...new Set(rows.map((e) => e.currency))];
		const rates = new Map<string, number>();

		for (const currency of uniqueCurrencies) {
			if (currency !== targetCurrency) {
				const rate = await this.exchangeRateRepo.lookup([currency, targetCurrency], conversionDate);
				if (rate) {
					rates.set(currency, Number.parseFloat(rate.exchangeRate));
				}
			}
		}

		for (const row of rows) {
			const amountInMinorUnits = Number.parseFloat(row.amount);
			const realAmount = monetary.fromRealAmount(amountInMinorUnits, row.currency);

			let convertedRealAmount = realAmount;
			if (row.currency !== targetCurrency) {
				const rate = rates.get(row.currency);
				if (!rate) continue;
				convertedRealAmount = realAmount * rate;
			}

			totalInMinorUnits += monetary.toRealAmount(convertedRealAmount, targetCurrency);
		}

		return Math.round(totalInMinorUnits);
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

		// STEP 2: Fetch expenses and income for this month
		const [thisMonthExpenses, thisMonthIncome] = await Promise.all([
			db
				.select({ amount: schema.expense.amount, currency: schema.expense.currency, date: schema.expense.date })
				.from(schema.expense)
				.where(and(eq(schema.expense.workspaceId, param.workspaceId), gte(schema.expense.date, thisMonthStart.toISOString()))),
			db
				.select({ amount: schema.income.amount, currency: schema.income.currency, date: schema.income.date })
				.from(schema.income)
				.where(and(eq(schema.income.workspaceId, param.workspaceId), gte(schema.income.date, thisMonthStart.toISOString()))),
		]);

		// STEP 3: Fetch expenses and income for last month
		const [lastMonthExpenses, lastMonthIncome] = await Promise.all([
			db
				.select({ amount: schema.expense.amount, currency: schema.expense.currency, date: schema.expense.date })
				.from(schema.expense)
				.where(and(eq(schema.expense.workspaceId, param.workspaceId), gte(schema.expense.date, lastMonthStart.toISOString()), sql`${schema.expense.date} < ${lastMonthEnd.toISOString()}`)),
			db
				.select({ amount: schema.income.amount, currency: schema.income.currency, date: schema.income.date })
				.from(schema.income)
				.where(and(eq(schema.income.workspaceId, param.workspaceId), gte(schema.income.date, lastMonthStart.toISOString()), sql`${schema.income.date} < ${lastMonthEnd.toISOString()}`)),
		]);

		// STEP 4: Convert and sum all four buckets
		const [totalExpensesThisMonth, totalExpensesLastMonth, totalIncomeThisMonth, totalIncomeLastMonth] =
			await Promise.all([
				this.convertAndSum(thisMonthExpenses, primaryCurrency, thisMonthEnd.toISOString()),
				this.convertAndSum(lastMonthExpenses, primaryCurrency, lastMonthEnd.toISOString()),
				this.convertAndSum(thisMonthIncome, primaryCurrency, thisMonthEnd.toISOString()),
				this.convertAndSum(lastMonthIncome, primaryCurrency, lastMonthEnd.toISOString()),
			]);

		// Get active wallets count
		const [walletsData] = await db
			.select({ count: count() })
			.from(schema.wallet)
			.where(
				and(eq(schema.wallet.workspaceId, param.workspaceId), eq(schema.wallet.isActive, true)),
			);

		// Last activity across both expenses and income
		const [lastExpense, lastIncome] = await Promise.all([
			db
				.select({ date: schema.expense.date })
				.from(schema.expense)
				.where(eq(schema.expense.workspaceId, param.workspaceId))
				.orderBy(sql`${schema.expense.date} DESC`)
				.limit(1),
			db
				.select({ date: schema.income.date })
				.from(schema.income)
				.where(eq(schema.income.workspaceId, param.workspaceId))
				.orderBy(sql`${schema.income.date} DESC`)
				.limit(1),
		]);

		const expenseDate = lastExpense[0]?.date ?? null;
		const incomeDate = lastIncome[0]?.date ?? null;
		const lastActivityAt =
			expenseDate && incomeDate
				? expenseDate > incomeDate ? expenseDate : incomeDate
				: expenseDate ?? incomeDate;

		// Calculate trend percentage based on expenses
		let trendPercentage = 0;
		if (totalExpensesLastMonth > 0) {
			trendPercentage =
				((totalExpensesThisMonth - totalExpensesLastMonth) / totalExpensesLastMonth) * 100;
		} else if (totalExpensesThisMonth > 0) {
			trendPercentage = 100;
		}

		return {
			id: workspace.id,
			slug: workspace.slug,
			name: workspace.name,
			logo: workspace.logo,
			totalExpensesThisMonth,
			totalExpensesLastMonth,
			totalIncomeThisMonth,
			totalIncomeLastMonth,
			activeWalletsCount: walletsData.count,
			trendPercentage: Math.round(trendPercentage * 100) / 100,
			lastActivityAt,
			primaryCurrency,
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
