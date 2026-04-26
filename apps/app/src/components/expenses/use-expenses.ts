import {
	type AmountFilterState,
	customDateRangeAtom,
	expenseAmountFilterAtom,
	expenseCategoryFilterAtom,
	expenseRepeatFilterAtom,
	expenseWalletFilterAtom,
	searchKeywordsAtom,
	selectDateRangeAtom,
} from "#app/atoms/index.ts";
import { useLiveQueryWallets } from "#app/components/wallets/use-wallets.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
import {
	calculateComparisonDateRange,
	filterDataByRange,
	getComparisonPeriodText,
} from "#app/helpers/date-range.ts";
import { calculatePercentageChange } from "#app/helpers/percentage-change.ts";
import { matchesSearch } from "#app/helpers/normalize-search.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import {
	categoryCollectionFactory,
	exchangeRateCollection,
	expenseCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";
import { datetime, toFromToDateObject } from "@hoalu/common/datetime";
import { calculateCrossRate, lookupExchangeRate } from "@hoalu/common/exchange-rate";
import { monetary } from "@hoalu/common/monetary";
import { zeroDecimalCurrencies } from "@hoalu/countries";
import { getRouteApi } from "@tanstack/react-router";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useAtomValue } from "jotai";
import { useDeferredValue, useMemo } from "react";

import type { SyncedCategory } from "#app/components/categories/use-categories.ts";
import type { RepeatSchema } from "@hoalu/common/schema";

const zeroDecimalSet = new Set(zeroDecimalCurrencies);
const expenseRouteApi = getRouteApi("/_dashboard/$slug/expenses");

export function useFilteredExpenses() {
	const expenses = useLiveQueryExpenses();
	const { date: searchByDate } = expenseRouteApi.useSearch();
	const range = toFromToDateObject(searchByDate);
	const searchKeywords = useAtomValue(searchKeywordsAtom);
	const selectedCategoryIds = useAtomValue(expenseCategoryFilterAtom);
	const selectedWalletIds = useAtomValue(expenseWalletFilterAtom);
	const selectedRepeat = useAtomValue(expenseRepeatFilterAtom);
	const amountFilter = useAtomValue(expenseAmountFilterAtom);
	const deferredSearchKeywords = useDeferredValue(searchKeywords);

	const filtered = useMemo(
		() =>
			filterExpenses(expenses, {
				selectedCategoryIds,
				selectedWalletIds,
				selectedRepeat,
				searchKeywords: deferredSearchKeywords,
				range,
				amountFilter,
			}),
		[
			expenses,
			selectedCategoryIds,
			selectedWalletIds,
			selectedRepeat,
			deferredSearchKeywords,
			range,
			amountFilter,
		],
	);

	return filtered;
}

function filterExpenses(
	data: SyncedExpense[],
	condition: {
		selectedCategoryIds: string[];
		selectedWalletIds: string[];
		selectedRepeat: RepeatSchema[];
		searchKeywords: string;
		range:
			| {
					from: Date;
					to: Date;
			  }
			| undefined;
		amountFilter: AmountFilterState;
	},
) {
	const {
		selectedCategoryIds,
		selectedWalletIds,
		selectedRepeat,
		searchKeywords,
		range,
		amountFilter,
	} = condition;
	const fromDate = range ? datetime.format(range.from, "yyyy-MM-dd") : undefined;
	const toDate = range ? datetime.format(range.to, "yyyy-MM-dd") : undefined;

	return data.filter((expense) => {
		if (fromDate && toDate) {
			if (expense.date < fromDate || expense.date > toDate) {
				return false;
			}
		}
		if (selectedCategoryIds.length > 0) {
			const categoryId = expense.category?.id;
			if (!categoryId || !selectedCategoryIds.includes(categoryId)) {
				return false;
			}
		}
		if (selectedWalletIds.length > 0) {
			const walletId = expense.wallet?.id;
			if (!walletId || !selectedWalletIds.includes(walletId)) {
				return false;
			}
		}
		if (selectedRepeat.length > 0) {
			if (!selectedRepeat.includes(expense.repeat)) {
				return false;
			}
		}
		if (amountFilter.min !== null || amountFilter.max !== null) {
			const amount = expense.realAmount;
			if (amountFilter.min !== null && amount < amountFilter.min) {
				return false;
			}
			if (amountFilter.max !== null && amount > amountFilter.max) {
				return false;
			}
		}
		if (searchKeywords) {
			return matchesSearch(searchKeywords, {
				textFields: [expense.title, expense.description],
				numericFields: [expense.realAmount],
			});
		}

		return true;
	});
}

interface UseExpenseStatsOptions {
	expenses: SyncedExpense[];
	categories: SyncedCategory[];
}

export function useExpenseStats(options: UseExpenseStatsOptions) {
	const expenses = options.expenses;
	const categories = options.categories;

	const {
		metadata: { currency },
	} = useWorkspace();
	const wallets = useLiveQueryWallets();

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

	// Build FX rate indexes once per fxRateData change — O(m), not O(n×m).
	// byPair: "FROM|TO" → rates (bidirectional) with pre-parsed date ms.
	// byTo: toCurrency → rates for cross-rate USD→X lookups.
	const fxRateIndex = useMemo(() => {
		type IndexedRate = (typeof fxRateData)[number] & { validFromMs: number; validToMs: number };
		const byPair = new Map<string, IndexedRate[]>();
		const byTo = new Map<string, IndexedRate[]>();

		for (const rate of fxRateData) {
			const r: IndexedRate = {
				...rate,
				validFromMs: new Date(rate.validFrom).getTime(),
				validToMs: new Date(rate.validTo).getTime(),
			};

			for (const key of [`${rate.from}|${rate.to}`, `${rate.to}|${rate.from}`]) {
				const list = byPair.get(key);
				if (list) list.push(r);
				else byPair.set(key, [r]);
			}

			const toList = byTo.get(rate.to);
			if (toList) toList.push(r);
			else byTo.set(rate.to, [r]);
		}

		return { byPair, byTo };
	}, [fxRateData]);

	const transformedExpenses = useMemo(() => {
		const { byPair, byTo } = fxRateIndex;

		const expenses = expensesData.map((expense) => {
			const dateMs = new Date(expense.created_at).getTime();

			const exchangeRate = lookupExchangeRate(
				{
					findDirect: ([from, to], _date) => {
						const match = byPair
							.get(`${from}|${to}`)
							?.find((r) => r.validFromMs <= dateMs && dateMs <= r.validToMs);

						if (!match) {
							return null;
						}

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
				[expense.currency, workspace.metadata.currency],
				expense.created_at,
			);
			const factor = zeroDecimalSet.has(expense.currency) ? 1 : 100;
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
	}, [expensesData, fxRateIndex, workspace.metadata.currency]);

	return transformedExpenses;
}

type SyncedExpenses = ReturnType<typeof useLiveQueryExpenses>;
export type SyncedExpense = SyncedExpenses[number];
