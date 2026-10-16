import { projectBills } from "@hoalu/finance/billing";
import { monetary } from "@hoalu/finance/monetary";
import { and, count, eq, gte, isNotNull, lte, sql, sum } from "drizzle-orm";

import { db, schema } from "#api/db/index.ts";
import { ExchangeRateRepository } from "#api/routes/exchange-rates/repository.ts";

import type { BillDefinition, Payment } from "@hoalu/finance/billing";

/**
 * "Today" on the server, in UTC — a request carries no timezone. The dashboard
 * computes its own local date, which is the surface the user actually reads;
 * this endpoint exists for non-browser consumers.
 */
function todayUtc(): string {
	return new Date().toISOString().slice(0, 10);
}

/** `yyyy-MM-dd` from a Date's local calendar components — never shifted through UTC. */
function dateLabel(date: Date): string {
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** A Postgres `numeric` sum arrives as a string; the API speaks minor units. */
function toMinorUnits(raw: string | null): number {
	const parsed = Number.parseFloat(raw ?? "0");
	return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

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
					rates.set(currency, rate.exchangeRate);
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
	 * All-time flow per wallet, grouped by the currency each transaction was
	 * recorded in.
	 *
	 * Grouping by currency rather than converting into the wallet's own keeps the
	 * figures true to what was entered and skips a per-transaction exchange-rate
	 * lookup. Active-wallet count rides along so the caller doesn't need a second
	 * query for it.
	 */
	private async getWalletFlow(workspaceId: string) {
		const [wallets, outflows, inflows] = await Promise.all([
			db
				.select({
					id: schema.wallet.id,
					name: schema.wallet.name,
					currency: schema.wallet.currency,
					isActive: schema.wallet.isActive,
				})
				.from(schema.wallet)
				.where(eq(schema.wallet.workspaceId, workspaceId)),
			db
				.select({
					walletId: schema.expense.walletId,
					currency: schema.expense.currency,
					total: sum(schema.expense.amount),
				})
				.from(schema.expense)
				.where(eq(schema.expense.workspaceId, workspaceId))
				.groupBy(schema.expense.walletId, schema.expense.currency),
			db
				.select({
					walletId: schema.income.walletId,
					currency: schema.income.currency,
					total: sum(schema.income.amount),
				})
				.from(schema.income)
				.where(eq(schema.income.workspaceId, workspaceId))
				.groupBy(schema.income.walletId, schema.income.currency),
		]);

		const walletsById = new Map(wallets.map((wallet) => [wallet.id, wallet]));
		const entries = new Map<
			string,
			{
				walletId: string;
				walletName: string;
				currency: string;
				isActive: boolean;
				inAmount: number;
				outAmount: number;
			}
		>();

		const entryFor = (walletId: string, currency: string) => {
			const key = `${walletId}|${currency}`;
			const existing = entries.get(key);
			if (existing) return existing;

			const wallet = walletsById.get(walletId);
			const created = {
				walletId,
				walletName: wallet?.name ?? "Wallet",
				currency,
				isActive: wallet?.isActive ?? true,
				inAmount: 0,
				outAmount: 0,
			};
			entries.set(key, created);
			// Every wallet gets a row in its own currency, even with no activity, so a
			// fund that has never been touched still reads as ₫0 rather than vanishing.
			if (wallet && wallet.currency !== currency) {
				entries.set(`${walletId}|${wallet.currency}`, {
					walletId,
					walletName: wallet.name,
					currency: wallet.currency,
					isActive: wallet.isActive,
					inAmount: 0,
					outAmount: 0,
				});
			}
			return created;
		};

		for (const wallet of wallets) {
			entryFor(wallet.id, wallet.currency);
		}
		for (const row of outflows) {
			entryFor(row.walletId, row.currency).outAmount += toMinorUnits(row.total);
		}
		for (const row of inflows) {
			entryFor(row.walletId, row.currency).inAmount += toMinorUnits(row.total);
		}

		const walletNets = [...entries.values()]
			.map((entry) => ({
				...entry,
				netAmount: entry.inAmount - entry.outAmount,
			}))
			.sort((a, b) => {
				const activity = (entry: typeof a) => Math.abs(entry.inAmount) + Math.abs(entry.outAmount);
				return activity(b) - activity(a) || a.walletName.localeCompare(b.walletName);
			});

		return {
			walletNets,
			activeWalletsCount: wallets.filter((wallet) => wallet.isActive).length,
		};
	}

	/**
	 * Unpaid bill occurrences, projected through the shared `projectBills` module
	 * so this page and the bills page can never disagree about what is owed.
	 */
	private async getBillsDue(workspaceId: string, today: string) {
		const bills = await db
			.select({
				id: schema.recurringBill.id,
				title: schema.recurringBill.title,
				amount: schema.recurringBill.amount,
				currency: schema.recurringBill.currency,
				repeat: schema.recurringBill.repeat,
				anchorDate: schema.recurringBill.anchorDate,
				dueDay: schema.recurringBill.dueDay,
				dueMonth: schema.recurringBill.dueMonth,
				createdAt: schema.recurringBill.createdAt,
			})
			.from(schema.recurringBill)
			.where(
				and(
					eq(schema.recurringBill.workspaceId, workspaceId),
					eq(schema.recurringBill.isActive, true),
				),
			);

		const payments = await db
			.select({
				expenseId: schema.expense.id,
				billId: schema.expense.recurringBillId,
				date: schema.expense.date,
			})
			.from(schema.expense)
			.where(
				and(eq(schema.expense.workspaceId, workspaceId), isNotNull(schema.expense.recurringBillId)),
			);

		const definitions: BillDefinition[] = bills.map((bill) => ({
			id: bill.id,
			repeat: bill.repeat,
			anchorDate: bill.anchorDate,
			dueDay: bill.dueDay,
			dueMonth: bill.dueMonth,
			startsOn: bill.createdAt.slice(0, 10),
		}));

		const paymentRows: Payment[] = payments
			.filter((payment): payment is typeof payment & { billId: string } => payment.billId !== null)
			.map((payment) => ({
				billId: payment.billId,
				expenseId: payment.expenseId,
				date: payment.date.slice(0, 10),
			}));

		const projection = projectBills({ bills: definitions, payments: paymentRows, today });
		const billsById = new Map(bills.map((bill) => [bill.id, bill]));

		// An overdue bill outranks anything in the future: the soonest due date among
		// everything unpaid is what the home page should surface first.
		const nextOccurrence = [...projection.overdue, ...projection.today, ...projection.upcoming]
			.slice()
			.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
		const nextBill = nextOccurrence ? billsById.get(nextOccurrence.billId) : undefined;

		return {
			overdue: projection.overdue.length,
			dueToday: projection.today.length,
			upcoming: projection.upcoming.length,
			next:
				nextOccurrence && nextBill
					? {
							title: nextBill.title,
							dueDate: nextOccurrence.dueDate,
							amount: monetary.fromRealAmount(Number(nextBill.amount), nextBill.currency),
							currency: nextBill.currency,
						}
					: null,
			unsupported: projection.unsupported,
		};
	}

	/**
	 * Get workspace summary for the home page.
	 *
	 * Leads with what the workspace *is*: the wallets' all-time flow, what bills
	 * are unpaid, and how this month's spend compares like-for-like with the same
	 * stretch of last month. Month-to-date expense and income totals were removed —
	 * unanchored, they answered nothing.
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
		const today = todayUtc();

		// STEP 1: Determine primary currency FIRST (most important!)
		const primaryCurrency = await this.getPrimaryCurrency(param.workspaceId);

		// STEP 2: Compare the same stretch of each month. `now` is mid-month for most
		// reads, so a complete previous month would make every comparison flatter
		// than reality.
		const now = new Date();
		const currentWindowStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const previousWindowStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const previousMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
		const sameStretchEnd = new Date(
			now.getFullYear(),
			now.getMonth() - 1,
			now.getDate(),
			23,
			59,
			59,
			999,
		);
		const previousWindowEnd =
			sameStretchEnd > previousMonthLastDay ? previousMonthLastDay : sameStretchEnd;

		const [currentMonthExpenses, previousStretchExpenses] = await Promise.all([
			db
				.select({
					amount: schema.expense.amount,
					currency: schema.expense.currency,
					date: schema.expense.date,
				})
				.from(schema.expense)
				.where(
					and(
						eq(schema.expense.workspaceId, param.workspaceId),
						gte(schema.expense.date, currentWindowStart.toISOString()),
					),
				),
			db
				.select({
					amount: schema.expense.amount,
					currency: schema.expense.currency,
					date: schema.expense.date,
				})
				.from(schema.expense)
				.where(
					and(
						eq(schema.expense.workspaceId, param.workspaceId),
						gte(schema.expense.date, previousWindowStart.toISOString()),
						lte(schema.expense.date, previousWindowEnd.toISOString()),
					),
				),
		]);

		const [currentAmount, previousAmount, { walletNets, activeWalletsCount }, bills] =
			await Promise.all([
				this.convertAndSum(currentMonthExpenses, primaryCurrency, now.toISOString()),
				this.convertAndSum(
					previousStretchExpenses,
					primaryCurrency,
					previousWindowEnd.toISOString(),
				),
				this.getWalletFlow(param.workspaceId),
				this.getBillsDue(param.workspaceId, today),
			]);

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
				? expenseDate > incomeDate
					? expenseDate
					: incomeDate
				: (expenseDate ?? incomeDate);

		// No spend last month is not a 100% rise; it is nothing to compare against.
		const changePercentage =
			previousAmount > 0
				? Math.round(((currentAmount - previousAmount) / previousAmount) * 10_000) / 100
				: null;

		return {
			id: workspace.id,
			slug: workspace.slug,
			name: workspace.name,
			logo: workspace.logo,
			primaryCurrency,
			activeWalletsCount,
			lastActivityAt,
			spend: {
				currentWindow: {
					from: dateLabel(currentWindowStart),
					to: dateLabel(now),
				},
				previousWindow: {
					from: dateLabel(previousWindowStart),
					to: dateLabel(previousWindowEnd),
				},
				currentAmount,
				previousAmount,
				changePercentage,
			},
			walletNets,
			bills,
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
