import { zeroDecimalCurrencies } from "@hoalu/countries";
import { datetime } from "@hoalu/datetime/datetime";
import { calculateCrossRate, lookupExchangeRate } from "@hoalu/finance/exchange-rate";
import { monetary } from "@hoalu/finance/monetary";

import {
	calculateComparisonDateRange,
	calculateDateRange,
	generateDailyDataForRange,
	generateDailyDataWithZeros,
	generateMTDDataWithZeros,
	getComparisonPeriodText,
	getStartOfWeek,
	groupDataByMonth,
	isMonthBasedRange,
} from "#app/helpers/date-range.ts";
import {
	calculatePercentageChange,
	type PercentageChange,
} from "#app/helpers/percentage-change.ts";

import type { ChartGroupBy, CustomDateRange, PredefinedDateRange } from "#app/atoms/filters.ts";
import type { ColorSchema } from "@hoalu/schema/schema";

/**
 * Dashboard model — the single read pipeline between synced collections and charts.
 *
 * Owns:
 * - FX conversion (one indexed path; `convertedAmount` is `null` when no rate exists)
 * - range series (one bucketing + zero-fill dispatch, honoring `chartGroupBy$`)
 * - period stats (pure aggregation + comparison)
 *
 * Global observable reads are confined to `use-dashboard-model.ts`; everything here is pure.
 */

// ---------------------------------------------------------------------------
// FX conversion
// ---------------------------------------------------------------------------

export interface FxRateRow {
	from: string;
	to: string;
	exchangeRate: string;
	inverseRate: string;
	validFrom: string;
	validTo: string;
}

type IndexedRate = FxRateRow & { validFromMs: number; validToMs: number };

export interface FxRateIndex {
	byPair: Map<string, IndexedRate[]>;
	byTo: Map<string, IndexedRate[]>;
}

/**
 * Build FX rate indexes once per rates change — O(m), not O(n×m) per transaction.
 * byPair: "FROM|TO" → rates (bidirectional) with pre-parsed date ms.
 * byTo: toCurrency → rates for cross-rate USD→X lookups.
 */
export function buildFxRateIndex(rates: FxRateRow[]): FxRateIndex {
	const byPair = new Map<string, IndexedRate[]>();
	const byTo = new Map<string, IndexedRate[]>();

	for (const rate of rates) {
		const indexed: IndexedRate = {
			...rate,
			validFromMs: new Date(rate.validFrom).getTime(),
			validToMs: new Date(rate.validTo).getTime(),
		};

		for (const key of [`${rate.from}|${rate.to}`, `${rate.to}|${rate.from}`]) {
			const list = byPair.get(key);
			if (list) list.push(indexed);
			else byPair.set(key, [indexed]);
		}

		const toList = byTo.get(rate.to);
		if (toList) toList.push(indexed);
		else byTo.set(rate.to, [indexed]);
	}

	return { byPair, byTo };
}

const zeroDecimalSet = new Set<string>(zeroDecimalCurrencies);

export interface ConvertibleTransaction {
	/** amount in minor units (e.g. cents); zero-decimal currencies use major units */
	amount: number;
	currency: string;
	date: string;
	created_at: string;
}

export interface ConvertedFields {
	/** yyyy-MM-dd */
	date: string;
	/** major units, source currency */
	amount: number;
	/** minor units, source currency */
	realAmount: number;
	/** major units, workspace currency — `null` when no FX rate exists */
	convertedAmount: number | null;
}

/**
 * The one FX path. Every synced expense/income row flows through here.
 */
export function convertTransactions<T extends ConvertibleTransaction>(
	rows: T[],
	fxIndex: FxRateIndex,
	targetCurrency: string,
): (T & ConvertedFields)[] {
	const { byPair, byTo } = fxIndex;

	return rows.map((row) => {
		const dateMs = new Date(row.created_at).getTime();

		const exchangeRate = lookupExchangeRate(
			{
				findDirect: ([from, to], _date) => {
					const match = byPair
						.get(`${from}|${to}`)
						?.find((r) => r.validFromMs <= dateMs && dateMs <= r.validToMs);

					if (!match) return null;

					return {
						fromCurrency: match.from,
						toCurrency: match.to,
						exchangeRate: match.exchangeRate,
						inverseRate: match.inverseRate,
					};
				},
				findCrossRate: ([from, to], _date) => {
					const usdToFrom = byTo
						.get(from)
						?.find((r) => r.validFromMs <= dateMs && dateMs <= r.validToMs);
					const usdToTo = byTo
						.get(to)
						?.find((r) => r.validFromMs <= dateMs && dateMs <= r.validToMs);

					return calculateCrossRate({ pair: [from, to], usdToFrom, usdToTo });
				},
			},
			[row.currency, targetCurrency],
			row.created_at,
		);

		const factor = zeroDecimalSet.has(row.currency) ? 1 : 100;
		const convertedAmount = exchangeRate
			? (row.amount * Number(exchangeRate.exchangeRate)) / factor
			: null;

		return {
			...row,
			date: datetime.format(row.date, "yyyy-MM-dd"),
			amount: monetary.fromRealAmount(Number(row.amount), row.currency),
			realAmount: Number(row.amount),
			convertedAmount,
		};
	});
}

// ---------------------------------------------------------------------------
// Transactions over a range
// ---------------------------------------------------------------------------

/** Minimal row shape the model derives from. SyncedExpense/SyncedIncome satisfy it. */
interface DashboardRow {
	date: string;
	convertedAmount: number | null;
	category?: { id?: string | undefined } | undefined;
}

export interface RangeSelection {
	dateRange: PredefinedDateRange;
	customRange?: CustomDateRange | null;
	groupBy?: ChartGroupBy;
}

/** The one null policy: a missing FX rate contributes 0 to sums. */
function sumConverted(rows: DashboardRow[]): number {
	let total = 0;
	for (const row of rows) {
		total += row.convertedAmount ?? 0;
	}
	return total;
}

function filterRowsByRange<T extends DashboardRow>(
	rows: T[],
	dateRange: PredefinedDateRange,
	customRange?: CustomDateRange | null,
): T[] {
	const range = calculateDateRange(dateRange, customRange);
	if (!range) return rows;
	const { startDate, endDate } = range;

	return rows.filter((row) => {
		const rowDate = datetime.parse(row.date, "yyyy-MM-dd", new Date());
		return rowDate >= startDate && rowDate <= endDate;
	});
}

// ---------------------------------------------------------------------------
// Series (bucketing + zero-fill)
// ---------------------------------------------------------------------------

export interface SeriesPoint {
	date: string;
	value: number;
	isMonthly?: boolean;
}

export type SeriesBucket = "day" | "month";

export interface DateValue {
	date: string;
	value: number;
}

/**
 * The one bucketing dispatch. Every time-series chart derives its x-axis here,
 * so charts cannot disagree on grouping (custom range + group-by month included).
 */
export function seriesForRange(
	sourceData: DateValue[],
	selection: RangeSelection,
): { bucket: SeriesBucket; points: SeriesPoint[] } {
	const { dateRange, customRange, groupBy = "date" } = selection;
	const today = new Date();

	if (dateRange === "ytd") {
		return { bucket: "month", points: groupDataByMonth(sourceData, true) };
	}
	if (dateRange === "all") {
		return { bucket: "month", points: groupDataByMonth(sourceData, false) };
	}
	if (isMonthBasedRange(dateRange)) {
		return { bucket: "month", points: groupDataByMonth(sourceData, false) };
	}
	if (dateRange === "mtd") {
		return { bucket: "day", points: generateMTDDataWithZeros(sourceData) };
	}
	if (dateRange === "wtd") {
		const startOfWeek = getStartOfWeek(today, 1);
		const endOfWeek = datetime.endOfDay(today);
		return { bucket: "day", points: generateDailyDataForRange(sourceData, startOfWeek, endOfWeek) };
	}
	if (dateRange === "custom" && customRange) {
		if (groupBy === "month") {
			return { bucket: "month", points: groupDataByMonth(sourceData, false) };
		}
		const startDate = datetime.startOfDay(customRange.from);
		const endDate = datetime.endOfDay(customRange.to);
		return { bucket: "day", points: generateDailyDataForRange(sourceData, startDate, endDate) };
	}
	if (dateRange === "7" || dateRange === "30" || dateRange === "90") {
		const days = parseInt(dateRange, 10);
		return { bucket: "day", points: generateDailyDataWithZeros(sourceData, days) };
	}
	return { bucket: "day", points: generateDailyDataWithZeros(sourceData, 50) };
}

function aggregateByDate(rows: DashboardRow[]): DateValue[] {
	const map = new Map<string, number>();
	for (const row of rows) {
		map.set(row.date, (map.get(row.date) ?? 0) + (row.convertedAmount ?? 0));
	}
	return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
}

/**
 * Per-date, per-category aggregation for the stacked-bar category mode.
 * Shape: [{ date, [categoryId]: amount, ... }]
 */
function aggregateByDateAndCategory(rows: DashboardRow[]): Record<string, number | string>[] {
	const byDate = new Map<string, Map<string, number>>();

	for (const row of rows) {
		const categoryId = row.category?.id ?? "uncategorized";
		let dateMap = byDate.get(row.date);
		if (!dateMap) {
			dateMap = new Map();
			byDate.set(row.date, dateMap);
		}
		dateMap.set(categoryId, (dateMap.get(categoryId) ?? 0) + (row.convertedAmount ?? 0));
	}

	return Array.from(byDate.entries()).map(([date, categoryMap]) => {
		const entry: Record<string, number | string> = { date };
		for (const [catId, amount] of categoryMap.entries()) {
			entry[catId] = amount;
		}
		return entry;
	});
}

// ---------------------------------------------------------------------------
// Period stats
// ---------------------------------------------------------------------------

interface PeriodStats {
	total: number;
	count: number;
	activeDays: number;
	previousTotal: number;
	previousCount: number;
	previousActiveDays: number;
	amountChange: PercentageChange;
	countChange: PercentageChange;
	activeDaysChange: PercentageChange;
	hasComparison: boolean;
	comparisonText: string | null;
}

function computePeriodStats(
	inRangeRows: DashboardRow[],
	allRows: DashboardRow[],
	selection: RangeSelection & { currency: string },
): PeriodStats {
	const { dateRange, customRange, currency } = selection;

	const comparisonRange = calculateComparisonDateRange(dateRange, customRange);
	const previousRows = comparisonRange
		? allRows.filter((row) => {
				const rowDate = datetime.parse(row.date, "yyyy-MM-dd", new Date());
				return rowDate >= comparisonRange.startDate && rowDate <= comparisonRange.endDate;
			})
		: [];

	const total = sumConverted(inRangeRows);
	const previousTotal = sumConverted(previousRows);
	const activeDays = new Set(inRangeRows.map((row) => row.date)).size;
	const previousActiveDays = new Set(previousRows.map((row) => row.date)).size;

	return {
		total,
		count: inRangeRows.length,
		activeDays,
		previousTotal,
		previousCount: previousRows.length,
		previousActiveDays,
		amountChange: calculatePercentageChange(total, previousTotal, currency),
		countChange: calculatePercentageChange(inRangeRows.length, previousRows.length, currency),
		activeDaysChange: calculatePercentageChange(activeDays, previousActiveDays, currency),
		hasComparison: comparisonRange !== null,
		comparisonText: getComparisonPeriodText(dateRange, customRange),
	};
}

// ---------------------------------------------------------------------------
// Cash flow
// ---------------------------------------------------------------------------

export interface CashFlowPoint {
	date: string;
	net: number;
	balance: number;
	isMonthly?: boolean;
}

/** Merged income/expense series with cumulative balance, on the shared bucketing. */
function cashFlowSeriesForRange(
	incomeData: DateValue[],
	expenseData: DateValue[],
	selection: RangeSelection,
): { bucket: SeriesBucket; points: CashFlowPoint[] } {
	const { bucket, points: incomePoints } = seriesForRange(incomeData, selection);
	const { points: expensePoints } = seriesForRange(expenseData, selection);

	const merged = new Map<string, { net: number; isMonthly?: boolean }>();

	for (const item of incomePoints) {
		merged.set(item.date, { net: item.value, isMonthly: item.isMonthly });
	}
	for (const item of expensePoints) {
		const existing = merged.get(item.date);
		if (existing) {
			existing.net -= item.value;
			existing.isMonthly = item.isMonthly ?? existing.isMonthly;
		} else {
			merged.set(item.date, { net: -item.value, isMonthly: item.isMonthly });
		}
	}

	const sorted = Array.from(merged.entries())
		.map(([date, values]) => ({ date, net: values.net, isMonthly: values.isMonthly }))
		.sort((a, b) => a.date.localeCompare(b.date));

	let balance = 0;
	const points = sorted.map((item) => {
		balance += item.net;
		return { date: item.date, net: item.net, balance, isMonthly: item.isMonthly };
	});

	return { bucket, points };
}

interface CashFlowSideStats {
	total: number;
	previousTotal: number;
	change: PercentageChange;
}

interface CashFlowStats {
	income: CashFlowSideStats;
	expenses: CashFlowSideStats;
	net: CashFlowSideStats;
	transactions: { count: number; previousCount: number; diff: number };
	hasComparison: boolean;
	comparisonText: string | null;
}

function computeCashFlowStats(
	inRangeIncomes: DashboardRow[],
	inRangeExpenses: DashboardRow[],
	allIncomes: DashboardRow[],
	allExpenses: DashboardRow[],
	selection: RangeSelection & { currency: string },
): CashFlowStats {
	const { dateRange, customRange, currency } = selection;

	const comparisonRange = calculateComparisonDateRange(dateRange, customRange);
	const inComparison = (row: DashboardRow) => {
		if (!comparisonRange) return false;
		const rowDate = datetime.parse(row.date, "yyyy-MM-dd", new Date());
		return rowDate >= comparisonRange.startDate && rowDate <= comparisonRange.endDate;
	};

	const previousIncomes = comparisonRange ? allIncomes.filter(inComparison) : [];
	const previousExpenses = comparisonRange ? allExpenses.filter(inComparison) : [];

	const incomeTotal = sumConverted(inRangeIncomes);
	const expensesTotal = sumConverted(inRangeExpenses);
	const previousIncomeTotal = sumConverted(previousIncomes);
	const previousExpensesTotal = sumConverted(previousExpenses);

	const net = incomeTotal - expensesTotal;
	const previousNet = previousIncomeTotal - previousExpensesTotal;
	const count = inRangeIncomes.length + inRangeExpenses.length;
	const previousCount = previousIncomes.length + previousExpenses.length;

	return {
		income: {
			total: incomeTotal,
			previousTotal: previousIncomeTotal,
			change: calculatePercentageChange(incomeTotal, previousIncomeTotal, currency),
		},
		expenses: {
			total: expensesTotal,
			previousTotal: previousExpensesTotal,
			change: calculatePercentageChange(expensesTotal, previousExpensesTotal, currency),
		},
		net: {
			total: net,
			previousTotal: previousNet,
			change: calculatePercentageChange(net, previousNet, currency),
		},
		transactions: { count, previousCount, diff: count - previousCount },
		hasComparison: comparisonRange !== null,
		comparisonText: getComparisonPeriodText(dateRange, customRange),
	};
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

/** Minimal category shape the model derives from. SyncedCategory satisfies it. */
export interface CategoryLike {
	id: string;
	name: string;
	color: ColorSchema;
}

export interface CategoryBreakdownEntry {
	id: string;
	name: string;
	color: ColorSchema;
	value: number;
}

/** In-range expense totals per category, positive only, sorted desc. */
function aggregateByCategory(
	inRangeRows: DashboardRow[],
	categories: CategoryLike[],
): CategoryBreakdownEntry[] {
	const totals = new Map<string, number>();
	for (const row of inRangeRows) {
		const categoryId = row.category?.id;
		if (!categoryId) continue;
		totals.set(categoryId, (totals.get(categoryId) ?? 0) + (row.convertedAmount ?? 0));
	}

	const infoById = new Map(categories.map((c) => [c.id, c]));

	return Array.from(totals.entries())
		.map(([categoryId, total]) => {
			const category = infoById.get(categoryId);
			return {
				id: categoryId,
				name: category?.name || "Unknown",
				color: category?.color || ("gray" as ColorSchema),
				value: total,
			};
		})
		.filter((entry) => entry.value > 0)
		.sort((a, b) => b.value - a.value);
}

// ---------------------------------------------------------------------------
// The whole dashboard model
// ---------------------------------------------------------------------------

export interface DashboardModelInput<C extends CategoryLike = CategoryLike> {
	expenses: DashboardRow[];
	incomes: DashboardRow[];
	categories: C[];
	currency: string;
	dateRange: PredefinedDateRange;
	customRange: CustomDateRange | null;
	groupBy: ChartGroupBy;
}

export interface DashboardModel<C extends CategoryLike = CategoryLike> {
	currency: string;
	range: {
		selected: PredefinedDateRange;
		custom: CustomDateRange | null;
		groupBy: ChartGroupBy;
		bucket: SeriesBucket;
		comparison: { startDate: Date; endDate: Date } | null;
		comparisonText: string | null;
		hasComparison: boolean;
	};
	expenses: {
		inRange: DashboardRow[];
		series: SeriesPoint[];
		byDateAndCategory: Record<string, number | string>[];
		stats: PeriodStats;
	};
	incomes: {
		inRange: DashboardRow[];
		series: SeriesPoint[];
		stats: PeriodStats;
	};
	cashFlow: {
		series: CashFlowPoint[];
		stats: CashFlowStats;
	};
	categories: {
		list: C[];
		infoMap: Record<string, { name: string; color: string }>;
		breakdown: CategoryBreakdownEntry[];
	};
}

export function createDashboardModel<C extends CategoryLike>(
	input: DashboardModelInput<C>,
): DashboardModel<C> {
	const { expenses, incomes, categories, currency, dateRange, customRange, groupBy } = input;
	const selection: RangeSelection = { dateRange, customRange, groupBy };
	const statsSelection = { ...selection, currency };

	const inRangeExpenses = filterRowsByRange(expenses, dateRange, customRange);
	const inRangeIncomes = filterRowsByRange(incomes, dateRange, customRange);

	const expenseSeries = seriesForRange(aggregateByDate(inRangeExpenses), selection);
	const incomeSeries = seriesForRange(aggregateByDate(inRangeIncomes), selection);

	const cashFlowSeries = cashFlowSeriesForRange(
		aggregateByDate(inRangeIncomes),
		aggregateByDate(inRangeExpenses),
		selection,
	);

	const expenseStats = computePeriodStats(inRangeExpenses, expenses, statsSelection);
	const incomeStats = computePeriodStats(inRangeIncomes, incomes, statsSelection);
	const cashFlowStats = computeCashFlowStats(
		inRangeIncomes,
		inRangeExpenses,
		incomes,
		expenses,
		statsSelection,
	);

	const categoryInfoMap: Record<string, { name: string; color: string }> = {};
	for (const category of categories) {
		categoryInfoMap[category.id] = { name: category.name, color: category.color };
	}
	categoryInfoMap.uncategorized = { name: "Uncategorized", color: "gray" };

	const comparisonRange = calculateComparisonDateRange(dateRange, customRange);

	return {
		currency,
		range: {
			selected: dateRange,
			custom: customRange,
			groupBy,
			bucket: expenseSeries.bucket,
			comparison: comparisonRange,
			comparisonText: expenseStats.comparisonText,
			hasComparison: comparisonRange !== null,
		},
		expenses: {
			inRange: inRangeExpenses,
			series: expenseSeries.points,
			byDateAndCategory: aggregateByDateAndCategory(inRangeExpenses),
			stats: expenseStats,
		},
		incomes: {
			inRange: inRangeIncomes,
			series: incomeSeries.points,
			stats: incomeStats,
		},
		cashFlow: {
			series: cashFlowSeries.points,
			stats: cashFlowStats,
		},
		categories: {
			list: categories,
			infoMap: categoryInfoMap,
			breakdown: aggregateByCategory(inRangeExpenses, categories),
		},
	};
}
