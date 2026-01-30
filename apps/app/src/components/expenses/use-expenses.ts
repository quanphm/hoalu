import { eq, useLiveQuery } from "@tanstack/react-db";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";
import { useMemo } from "react";

import { datetime } from "@hoalu/common/datetime";
import { calculateCrossRate, lookupExchangeRate } from "@hoalu/common/exchange-rate";
import { monetary } from "@hoalu/common/monetary";
import { zeroDecimalCurrencies } from "@hoalu/countries";

import { customDateRangeAtom, selectDateRangeAtom, selectedExpenseAtom } from "#app/atoms/index.ts";
import type { SyncedCategory } from "#app/components/categories/use-categories.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
import {
	calculateComparisonDateRange,
	filterDataByRange,
	getComparisonPeriodText,
} from "#app/helpers/date-range.ts";
import { calculatePercentageChange } from "#app/helpers/percentage-change.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
	categoryCollectionFactory,
	exchangeRateCollection,
	expenseCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";
import { walletsQueryOptions } from "#app/services/query-options.ts";

export function useSelectedExpense() {
	const [expense, setSelectedExpense] = useAtom(selectedExpenseAtom);
	const onSelectExpense = (id: string | null) => {
		setSelectedExpense({ id });
	};
	return { expense, onSelectExpense };
}

interface UseExpenseStatsOptions {
	expenses: SyncedExpense[];
	categories: SyncedCategory[];
}

export function useExpenseStats(options: UseExpenseStatsOptions) {
	const expenses = options.expenses;
	const categories = options.categories;

	const {
		slug,
		metadata: { currency },
	} = useWorkspace();
	const { data: wallets } = useSuspenseQuery(walletsQueryOptions(slug));

	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);

	// Get current period data
	const currentPeriodData = filterDataByRange(expenses, dateRange, customRange);

	// Get comparison period data
	const comparisonRange = calculateComparisonDateRange(dateRange, customRange);
	const previousPeriodData = comparisonRange
		? expenses.filter((expense) => {
				const expenseDate = datetime.parse(expense.date, "yyyy-MM-dd", new Date());
				return expenseDate >= comparisonRange.startDate && expenseDate <= comparisonRange.endDate;
			})
		: [];

	// Calculate current period stats
	const currentAggregationByDate = new Map<string, number>();
	const currentAggregationByDateAndCategory = new Map<string, Map<string, number>>();
	let currentTotalAmount = 0;
	const currentRepeatCount: Record<string, number> = {};

	for (const expense of currentPeriodData) {
		const amount = expense.convertedAmount > 0 ? expense.convertedAmount : 0;
		currentTotalAmount += amount;
		currentRepeatCount[expense.repeat] = (currentRepeatCount[expense.repeat] || 0) + 1;

		const currentValue = currentAggregationByDate.get(expense.date) || 0;
		currentAggregationByDate.set(expense.date, currentValue + amount);

		// Aggregate by date and category
		const categoryId = expense.category?.id ?? "uncategorized";
		if (!currentAggregationByDateAndCategory.has(expense.date)) {
			currentAggregationByDateAndCategory.set(expense.date, new Map());
		}
		const dateCategoryMap = currentAggregationByDateAndCategory.get(expense.date)!;
		dateCategoryMap.set(categoryId, (dateCategoryMap.get(categoryId) || 0) + amount);
	}

	// Calculate previous period stats
	let previousTotalAmount = 0;
	for (const expense of previousPeriodData) {
		const amount = expense.convertedAmount > 0 ? expense.convertedAmount : 0;
		previousTotalAmount += amount;
	}

	const currentActiveDays = new Set(currentPeriodData.map((e) => e.date)).size;
	const previousActiveDays = new Set(previousPeriodData.map((e) => e.date)).size;

	// Get comparison period text
	const comparisonText = getComparisonPeriodText(dateRange, customRange);

	// Calculate percentage changes
	const totalAmountChange = calculatePercentageChange(
		currentTotalAmount,
		previousTotalAmount,
		currency,
	);
	const transactionCountChange = calculatePercentageChange(
		currentPeriodData.length,
		previousPeriodData.length,
		currency,
	);
	const activeDaysChange = calculatePercentageChange(
		currentActiveDays,
		previousActiveDays,
		currency,
	);

	const categoryCount: Record<string, number> = {};
	for (const category of categories) {
		categoryCount[category.id] = category.total;
	}

	const walletCount: Record<string, number> = {};
	for (const wallet of wallets) {
		walletCount[wallet.id] = wallet.total;
	}

	const repeatCount: Record<string, number> = {};
	for (const expense of expenses) {
		const repeatValue = expense.repeat;
		if (!repeatCount[repeatValue]) {
			repeatCount[repeatValue] = 1;
		} else {
			repeatCount[repeatValue] += 1;
		}
	}

	const result: { date: string; value: number }[] = Array.from(
		currentAggregationByDate.entries(),
	).map(([date, value]) => ({ date, value }));

	// Build byDateAndCategory: array of { date, [categoryId]: amount, ... }
	const byDateAndCategory: Record<string, number | string>[] = Array.from(
		currentAggregationByDateAndCategory.entries(),
	).map(([date, categoryMap]) => {
		const entry: Record<string, number | string> = { date };
		for (const [catId, amount] of categoryMap.entries()) {
			entry[catId] = amount;
		}
		return entry;
	});

	// Build category info map for chart colors/labels
	const categoryInfoMap: Record<string, { name: string; color: string }> = {};
	for (const category of categories) {
		categoryInfoMap[category.id] = { name: category.name, color: category.color };
	}
	categoryInfoMap.uncategorized = { name: "Uncategorized", color: "gray" };

	return {
		amount: {
			total: formatCurrency(currentTotalAmount, currency),
			totalRaw: currentTotalAmount,
			change: totalAmountChange,
		},
		transactions: {
			total: currentPeriodData.length,
			change: transactionCountChange,
			byCategory: categoryCount,
			byWallet: walletCount,
			byRepeat: repeatCount,
		},
		activeDays: {
			total: currentActiveDays,
			change: activeDaysChange,
		},
		aggregation: {
			byDate: result,
			byDateAndCategory,
		},
		categoryInfoMap,
		hasComparison: comparisonRange !== null,
		comparisonText,
	};
}

export function useLiveQueryExpenses() {
	const workspace = useWorkspace();
	const expenseCollection = expenseCollectionFactory(workspace.slug);
	const categoryCollection = categoryCollectionFactory(workspace.slug);
	const walletCollection = walletCollectionFactory(workspace.slug);

	const { data: expensesData } = useLiveQuery(
		(q) => {
			return q
				.from({ expense: expenseCollection })
				.innerJoin({ wallet: walletCollection }, ({ expense, wallet }) =>
					eq(expense.wallet_id, wallet.id),
				)
				.leftJoin({ category: categoryCollection }, ({ expense, category }) =>
					eq(expense.category_id, category.id),
				)
				.orderBy(({ expense }) => expense.date, "desc")
				.orderBy(({ expense }) => expense.amount, "desc")
				.select(({ expense, wallet, category }) => ({
					...expense,
					category: {
						id: category?.id,
						name: category?.name,
						color: category?.color,
					},
					wallet: {
						id: wallet.id,
						name: wallet.name,
						type: wallet.type,
					},
				}));
		},
		[workspace.slug],
	);

	const { data: fxRateData } = useLiveQuery((q) => {
		return q.from({ fxRate: exchangeRateCollection }).fn.select(({ fxRate }) => ({
			from: fxRate.from_currency,
			to: fxRate.to_currency,
			exchangeRate: `${fxRate.exchange_rate}`,
			inverseRate: `${fxRate.inverse_rate}`,
			validFrom: fxRate.valid_from,
			validTo: fxRate.valid_to,
		}));
	});

	const transformedExpenses = useMemo(() => {
		const expenses = expensesData.map((expense) => {
			const exchangeRate = lookupExchangeRate(
				{
					findDirect: ([from, to], date) => {
						const maybeCorrectRate = fxRateData.find((rate) => {
							const betweenValidFromTo =
								new Date(rate.validFrom) <= new Date(date) &&
								new Date(date) <= new Date(rate.validTo);

							const correctFromTo =
								(rate.from === from && rate.to === to) || (rate.from === to && rate.to === from);

							return betweenValidFromTo && correctFromTo;
						});

						if (!maybeCorrectRate) return null;

						return {
							fromCurrency: maybeCorrectRate.from,
							toCurrency: maybeCorrectRate.to,
							exchangeRate: `${maybeCorrectRate.exchangeRate}`,
							inverseRate: `${maybeCorrectRate.inverseRate}`,
						};
					},
					findCrossRate: ([from, to], date) => {
						const usdRates = fxRateData.filter((rate) => {
							const betweenValidFromTo =
								new Date(rate.validFrom) <= new Date(date) &&
								new Date(date) <= new Date(rate.validTo);

							const correctTo = rate.to === from || rate.to === to;

							return betweenValidFromTo && correctTo;
						});

						const rates = calculateCrossRate({
							pair: [from, to],
							usdToFrom: usdRates.find((rate) => rate.to === from),
							usdToTo: usdRates.find((rate) => rate.to === to),
						});

						return rates;
					},
				},
				[expense.currency, workspace.metadata.currency],
				expense.created_at,
			);
			const isNoCent = zeroDecimalCurrencies.find((c) => c === expense.currency);
			const factor = isNoCent ? 1 : 100;
			const convertedAmount =
				expense.amount * ((exchangeRate ? Number(exchangeRate.exchangeRate) : 0) / factor);

			return {
				...expense,
				date: datetime.format(expense.date, "yyyy-MM-dd"),
				amount: monetary.fromRealAmount(Number(expense.amount), expense.currency),
				realAmount: Number(expense.amount),
				convertedAmount: convertedAmount,
			};
		});
		return expenses;
	}, [expensesData, fxRateData, workspace.metadata.currency]);

	return transformedExpenses;
}

type SyncedExpenses = ReturnType<typeof useLiveQueryExpenses>;
export type SyncedExpense = SyncedExpenses[number];
