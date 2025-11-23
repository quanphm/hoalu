import { eq, useLiveQuery } from "@tanstack/react-db";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";
import { useMemo } from "react";

import { datetime } from "@hoalu/common/datetime";
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
import { categoryCollection } from "#app/lib/collections/category.ts";
import { expenseCollection } from "#app/lib/collections/expense.ts";
import { walletCollection } from "#app/lib/collections/wallet.ts";
import { queryClient } from "#app/lib/query-client.ts";
import { exchangeRatesQueryOptions, walletsQueryOptions } from "#app/services/query-options.ts";

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

export function useLiveQueryExpenses() {
	const workspace = useWorkspace();

	const { data } = useLiveQuery(
		(q) => {
			return q
				.from({ expense: expenseCollection(workspace.id) })
				.innerJoin({ wallet: walletCollection(workspace.id) }, ({ expense, wallet }) =>
					eq(expense.wallet_id, wallet.id),
				)
				.leftJoin({ category: categoryCollection(workspace.id) }, ({ expense, category }) =>
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
		[workspace.id],
	);

	const transformedExpenses = useMemo(async () => {
		if (!data) return [];

		const expenses = data.map((expense) => {
			return {
				...expense,
				date: datetime.format(expense.date, "yyyy-MM-dd"),
				amount: monetary.fromRealAmount(Number(expense.amount), expense.currency),
				realAmount: Number(expense.amount),
				convertedAmount: Number(expense.amount),
			};
		});

		const promises = expenses.map(async (expense) => {
			const { realAmount, currency: sourceCurrency } = expense;

			try {
				const result = await queryClient.fetchQuery(
					exchangeRatesQueryOptions({
						from: sourceCurrency,
						to: (workspace as any).metadata.currency,
					}),
				);
				const isNoCent = zeroDecimalCurrencies.find((c) => c === sourceCurrency);
				const factor = isNoCent ? 1 : 100;
				const convertedAmount = realAmount * (result.rate / factor);
				return {
					...expense,
					convertedAmount: convertedAmount,
				};
			} catch (_error) {
				return {
					...expense,
					convertedAmount: -1,
				};
			}
		});

		const result = await Promise.all(promises);
		return result;
	}, [data]);

	return transformedExpenses;
}

type SyncedExpenses = ReturnType<typeof useLiveQueryExpenses>;
export type SyncedExpense = SyncedExpenses[number];

export function useLiveQueryExpenseById(id: string | null) {
	const workspace = useWorkspace();

	const { data } = useLiveQuery(
		(q) => {
			if (!id) return undefined;

			return q
				.from({ expense: expenseCollection(workspace.id) })
				.innerJoin({ wallet: walletCollection(workspace.id) }, ({ expense, wallet }) =>
					eq(expense.wallet_id, wallet.id),
				)
				.leftJoin({ category: categoryCollection(workspace.id) }, ({ expense, category }) =>
					eq(expense.category_id, category.id),
				)
				.where(({ expense }) => eq(expense.id, id))
				.findOne()
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
		[id],
	);

	const transformedExpense = useMemo(() => {
		if (!data) return null;

		return {
			...data,
			date: datetime.format(data.date, "yyyy-MM-dd"),
			amount: monetary.fromRealAmount(Number(data.amount), data.currency),
			realAmount: Number(data.amount),
			convertedAmount: Number(data.amount),
		};
	}, [data]);

	return transformedExpense;
}
