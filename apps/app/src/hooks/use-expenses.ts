import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useDeferredValue } from "react";

import { datetime, toFromToDateObject } from "@hoalu/common/datetime";
import {
	customDateRangeAtom,
	expenseCategoryFilterAtom,
	expenseRepeatFilterAtom,
	expenseWalletFilterAtom,
	searchKeywordsAtom,
	selectDateRangeAtom,
	selectedExpenseAtom,
} from "@/atoms";
import { formatCurrency } from "@/helpers/currency";
import {
	calculateComparisonDateRange,
	filterDataByRange,
	getComparisonPeriodText,
} from "@/helpers/date-range";
import { calculatePercentageChange } from "@/helpers/percentage-change";
import type { ExpenseWithClientConvertedSchema, RepeatSchema } from "@/lib/schema";
import {
	categoriesQueryOptions,
	expensesQueryOptions,
	walletsQueryOptions,
} from "@/services/query-options";
import { useWorkspace } from "./use-workspace";

const routeApi = getRouteApi("/_dashboard/$slug/expenses");

const select = (
	data: ExpenseWithClientConvertedSchema[],
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
	},
) => {
	const { selectedCategoryIds, selectedWalletIds, selectedRepeat, searchKeywords, range } =
		condition;
	const fromDate = range ? datetime.format(range.from, "yyyy-MM-dd") : undefined;
	const toDate = range ? datetime.format(range.to, "yyyy-MM-dd") : undefined;

	return data.filter((expense) => {
		// Date range filter
		if (fromDate && toDate) {
			if (expense.date < fromDate || expense.date > toDate) {
				return false;
			}
		}
		// Category filter
		if (selectedCategoryIds.length > 0) {
			const categoryId = expense.category?.id;
			if (!categoryId || !selectedCategoryIds.includes(categoryId)) {
				return false;
			}
		}
		// Wallet filter
		if (selectedWalletIds.length > 0) {
			const walletId = expense.wallet?.id;
			if (!walletId || !selectedWalletIds.includes(walletId)) {
				return false;
			}
		}
		// Repeat filter
		if (selectedRepeat.length > 0) {
			if (!selectedRepeat.includes(expense.repeat)) {
				return false;
			}
		}
		// Search by keywords
		if (searchKeywords) {
			return expense.title.toLowerCase().includes(searchKeywords.toLowerCase());
		}

		return true;
	});
};

export function useExpenses() {
	const { date: searchByDate } = routeApi.useSearch();
	const { slug } = useWorkspace();

	const range = toFromToDateObject(searchByDate);
	const searchKeywords = useAtomValue(searchKeywordsAtom);
	const selectedCategoryIds = useAtomValue(expenseCategoryFilterAtom);
	const selectedWalletIds = useAtomValue(expenseWalletFilterAtom);
	const selectedRepeat = useAtomValue(expenseRepeatFilterAtom);

	// experiment
	const deferredSearchKeywords = useDeferredValue(searchKeywords);

	const { data } = useSuspenseQuery({
		...expensesQueryOptions(slug),
		select: useCallback(
			(expenses: ExpenseWithClientConvertedSchema[]) => {
				return select(expenses, {
					selectedCategoryIds,
					selectedWalletIds,
					selectedRepeat,
					searchKeywords: deferredSearchKeywords,
					range,
				});
			},
			[selectedCategoryIds, selectedWalletIds, selectedRepeat, deferredSearchKeywords, range],
		),
	});

	const selectedExpense = useAtomValue(selectedExpenseAtom);
	const currentIndex = data.findIndex((item) => item.id === selectedExpense.id);

	return { data, currentIndex };
}

export function useSelectedExpense() {
	const [expense, setSelectedExpense] = useAtom(selectedExpenseAtom);
	const onSelectExpense = useCallback((id: string | null) => {
		setSelectedExpense({ id });
	}, []);

	return { expense, onSelectExpense };
}

export function useExpenseStatsWithComparison() {
	const { slug } = useWorkspace();
	const {
		metadata: { currency },
	} = useWorkspace();
	const { data: expenses } = useSuspenseQuery(expensesQueryOptions(slug));
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));
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
	let currentTotalAmount = 0;
	const currentRepeatCount: Record<string, number> = {};

	for (const expense of currentPeriodData) {
		const amount = expense.convertedAmount > 0 ? expense.convertedAmount : 0;
		currentTotalAmount += amount;
		currentRepeatCount[expense.repeat] = (currentRepeatCount[expense.repeat] || 0) + 1;

		const currentValue = currentAggregationByDate.get(expense.date) || 0;
		currentAggregationByDate.set(expense.date, currentValue + amount);
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
	const totalAmountChange = calculatePercentageChange(currentTotalAmount, previousTotalAmount);
	const transactionCountChange = calculatePercentageChange(
		currentPeriodData.length,
		previousPeriodData.length,
	);
	const activeDaysChange = calculatePercentageChange(currentActiveDays, previousActiveDays);

	const categoryCount: Record<string, number> = {};
	for (const category of categories) {
		categoryCount[category.id] = category.total;
	}

	const walletCount: Record<string, number> = {};
	for (const wallet of wallets) {
		walletCount[wallet.id] = wallet.total;
	}

	const result: { date: string; value: number }[] = Array.from(
		currentAggregationByDate.entries(),
	).map(([date, value]) => ({ date, value }));

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
			byRepeat: currentRepeatCount,
		},
		activeDays: {
			total: currentActiveDays,
			change: activeDaysChange,
		},
		aggregation: {
			byDate: result,
		},
		hasComparison: comparisonRange !== null,
		comparisonText,
	};
}
