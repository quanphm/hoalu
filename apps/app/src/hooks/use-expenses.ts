import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";

import { datetime } from "@hoalu/common/datetime";

import { customDateRangeAtom, selectDateRangeAtom, selectedExpenseAtom } from "#app/atoms/index.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
import {
	calculateComparisonDateRange,
	filterDataByRange,
	getComparisonPeriodText,
} from "#app/helpers/date-range.ts";
import { calculatePercentageChange } from "#app/helpers/percentage-change.ts";
import { walletsQueryOptions } from "#app/services/query-options.ts";
import { useCategoryLiveQuery, useExpenseLiveQuery } from "./use-db";
import { useWorkspace } from "./use-workspace";

export function useSelectedExpense() {
	const [expense, setSelectedExpense] = useAtom(selectedExpenseAtom);
	const onSelectExpense = (id: string | null) => {
		setSelectedExpense({ id });
	};
	return { expense, onSelectExpense };
}

export function useExpenseStats() {
	const { slug } = useWorkspace();
	const {
		metadata: { currency },
	} = useWorkspace();
	const expenses = useExpenseLiveQuery();
	const categories = useCategoryLiveQuery();
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
		},
		hasComparison: comparisonRange !== null,
		comparisonText,
	};
}
