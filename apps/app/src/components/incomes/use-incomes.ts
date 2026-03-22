import { selectedIncomeAtom } from "#app/atoms/income-filters.ts";
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
	incomeCollectionFactory,
	walletCollectionFactory,
} from "#app/lib/collections/index.ts";
import { datetime } from "@hoalu/common/datetime";
import { calculateCrossRate, lookupExchangeRate } from "@hoalu/common/exchange-rate";
import { monetary } from "@hoalu/common/monetary";
import { zeroDecimalCurrencies } from "@hoalu/countries";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useAtom, useAtomValue } from "jotai";
import { useMemo } from "react";
import { customDateRangeAtom, selectDateRangeAtom } from "#app/atoms/filters.ts";

export function useSelectedIncome() {
	const [income, setSelectedIncome] = useAtom(selectedIncomeAtom);
	const onSelectIncome = (id: string | null) => {
		setSelectedIncome({ id });
	};
	return { income, onSelectIncome };
}

export function useLiveQueryIncomes() {
	const workspace = useWorkspace();
	const incomeCollection = incomeCollectionFactory(workspace.slug);
	const categoryCollection = categoryCollectionFactory(workspace.slug);
	const walletCollection = walletCollectionFactory(workspace.slug);

	const { data: incomesData } = useLiveQuery(
		(q) => {
			return q
				.from({ income: incomeCollection })
				.innerJoin({ wallet: walletCollection }, ({ income, wallet }) =>
					eq(income.wallet_id, wallet.id),
				)
				.leftJoin({ category: categoryCollection }, ({ income, category }) =>
					eq(income.category_id, category.id),
				)
				.orderBy(({ income }) => income.date, "desc")
				.orderBy(({ income }) => income.amount, "desc")
				.select(({ income, wallet, category }) => ({
					...income,
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

	const transformedIncomes = useMemo(() => {
		if (!incomesData) return [];
		const incomes = incomesData.map((income) => {
			const exchangeRate = lookupExchangeRate(
				{
					findDirect: ([from, to], date) => {
						const maybeCorrectRate = fxRateData?.find((rate) => {
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
						const usdRates = fxRateData?.filter((rate) => {
							const betweenValidFromTo =
								new Date(rate.validFrom) <= new Date(date) &&
								new Date(date) <= new Date(rate.validTo);

							const correctTo = rate.to === from || rate.to === to;

							return betweenValidFromTo && correctTo;
						});

						const rates = calculateCrossRate({
							pair: [from, to],
							usdToFrom: usdRates?.find((rate) => rate.to === from),
							usdToTo: usdRates?.find((rate) => rate.to === to),
						});

						return rates;
					},
				},
				[income.currency, workspace.metadata.currency],
				income.created_at,
			);
			const isNoCent = zeroDecimalCurrencies.find((c) => c === income.currency);
			const factor = isNoCent ? 1 : 100;
			const convertedAmount =
				income.amount * ((exchangeRate ? Number(exchangeRate.exchangeRate) : 0) / factor);

			return {
				...income,
				date: datetime.format(income.date, "yyyy-MM-dd"),
				amount: monetary.fromRealAmount(Number(income.amount), income.currency),
				realAmount: Number(income.amount),
				convertedAmount: convertedAmount,
			};
		});
		return incomes;
	}, [incomesData, fxRateData, workspace.metadata.currency]);

	return transformedIncomes;
}

export type IncomesClient = ReturnType<typeof useLiveQueryIncomes>;
export type IncomeClient = IncomesClient[number];

interface UseIncomeStatsOptions {
	incomes: IncomeClient[];
}

export function useIncomeStats(options: UseIncomeStatsOptions) {
	const incomes = options.incomes;

	const {
		metadata: { currency },
	} = useWorkspace();

	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);

	// Get current period data
	const currentPeriodData = filterDataByRange(incomes, dateRange, customRange);

	// Get comparison period data
	const comparisonRange = calculateComparisonDateRange(dateRange, customRange);
	const previousPeriodData = comparisonRange
		? incomes.filter((income) => {
				const incomeDate = datetime.parse(income.date, "yyyy-MM-dd", new Date());
				return incomeDate >= comparisonRange.startDate && incomeDate <= comparisonRange.endDate;
			})
		: [];

	// Calculate current period stats
	let currentTotalAmount = 0;
	for (const income of currentPeriodData) {
		const amount = income.convertedAmount > 0 ? income.convertedAmount : 0;
		currentTotalAmount += amount;
	}

	// Calculate previous period stats
	let previousTotalAmount = 0;
	for (const income of previousPeriodData) {
		const amount = income.convertedAmount > 0 ? income.convertedAmount : 0;
		previousTotalAmount += amount;
	}

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

	return {
		amount: {
			total: formatCurrency(currentTotalAmount, currency),
			totalRaw: currentTotalAmount,
			change: totalAmountChange,
		},
		transactions: {
			total: currentPeriodData.length,
			change: transactionCountChange,
		},
		hasComparison: comparisonRange !== null,
		comparisonText,
	};
}
