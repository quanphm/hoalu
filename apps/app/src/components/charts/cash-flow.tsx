import { customDateRangeAtom, selectDateRangeAtom } from "#app/atoms/filters.ts";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import {
	// PulseOrb,
	MoodGlow,
} from "#app/components/orb-motion.tsx";
import { PercentageChangeDisplay } from "#app/components/percentage-change.tsx";
import { calculateComparisonDateRange, filterDataByRange } from "#app/helpers/date-range.ts";
import { formatNumber } from "#app/helpers/number.ts";
import { calculatePercentageChange } from "#app/helpers/percentage-change.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { datetime } from "@hoalu/common/datetime";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { cn } from "@hoalu/ui/utils";
import { useAtomValue } from "jotai";

import type { SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import type { SyncedIncome } from "#app/components/incomes/use-incomes.ts";

interface CashFlowSectionProps {
	incomes: SyncedIncome[];
	expenses: SyncedExpense[];
}

export function CashFlowSection(props: CashFlowSectionProps) {
	const {
		metadata: { currency },
	} = useWorkspace();
	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);

	// Current period
	const filteredIncomes = filterDataByRange(props.incomes, dateRange, customRange);
	const filteredExpenses = filterDataByRange(props.expenses, dateRange, customRange);

	const totalIncome = filteredIncomes.reduce(
		(sum, income) => sum + (income.convertedAmount > 0 ? income.convertedAmount : 0),
		0,
	);
	const totalExpenses = filteredExpenses.reduce(
		(sum, expense) => sum + (expense.convertedAmount > 0 ? expense.convertedAmount : 0),
		0,
	);
	const netCashFlow = totalIncome - totalExpenses;
	const totalTransactions = filteredExpenses.length;

	// Previous (comparison) period
	const comparisonRange = calculateComparisonDateRange(dateRange, customRange);
	let prevIncome = 0;
	let prevExpenses = 0;
	let prevTransactions = 0;
	let prevNetCashFlow = 0;

	if (comparisonRange) {
		const { startDate, endDate } = comparisonRange;
		const prevIncomes = props.incomes.filter((i) => {
			const d = datetime.parse(i.date, "yyyy-MM-dd", new Date());
			return d >= startDate && d <= endDate;
		});
		const prevExp = props.expenses.filter((e) => {
			const d = datetime.parse(e.date, "yyyy-MM-dd", new Date());
			return d >= startDate && d <= endDate;
		});
		prevIncome = prevIncomes.reduce(
			(sum, i) => sum + (i.convertedAmount > 0 ? i.convertedAmount : 0),
			0,
		);
		prevExpenses = prevExp.reduce(
			(sum, e) => sum + (e.convertedAmount > 0 ? e.convertedAmount : 0),
			0,
		);
		prevNetCashFlow = prevIncome - prevExpenses;
		prevTransactions = prevExp.length;
	}

	const incomeChange = calculatePercentageChange(totalIncome, prevIncome, currency);
	const expensesChange = calculatePercentageChange(totalExpenses, prevExpenses, currency);
	const cashFlowChange = calculatePercentageChange(netCashFlow, prevNetCashFlow, currency);
	// const transactionsChange = calculatePercentageChange(
	// 	totalTransactions,
	// 	prevTransactions,
	// 	currency,
	// );

	const showTrend = comparisonRange !== null;

	return (
		<div
			className={cn(
				"grid w-full grid-cols-1 md:grid-cols-4",
				"*:data-[slot=card]:border-l-0 *:data-[slot=card]:last:border-r-0 *:data-[slot=card]:md:py-3",
			)}
		>
			<Card className="@container/card overflow-hidden">
				{showTrend && <MoodGlow trend={cashFlowChange.status === "increase"} />}
				{/* <PulseOrb
					trend={showTrend ? (cashFlowChange.status === "increase" ? 1 : -1) : 0}
					corner="bottom-center"
					size={110}
				/> */}
				<CardHeader className="relative">
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span className="tracking-wider">Cash Flow</span>
					</CardDescription>
					<CardAction>
						{showTrend && (
							<PercentageChangeDisplay
								change={cashFlowChange}
								className="[&>*>span]:text-xs [&>button]:h-1"
							/>
						)}
					</CardAction>
					<CardTitle
						className={cn("text-xl", netCashFlow >= 0 ? "text-success" : "text-destructive")}
					>
						<CurrencyValue value={netCashFlow} currency={currency} className="text-xl" />
					</CardTitle>
				</CardHeader>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span className="tracking-wider">Income</span>
					</CardDescription>
					<CardAction>
						{showTrend && (
							<PercentageChangeDisplay
								change={incomeChange}
								className="[&>*>span]:text-xs [&>button]:h-1"
							/>
						)}
					</CardAction>
					<CardTitle className="text-xl">
						<CurrencyValue value={totalIncome} currency={currency} className="text-xl" />
					</CardTitle>
				</CardHeader>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span className="tracking-wider">Expenses</span>
					</CardDescription>
					<CardAction>
						{showTrend && (
							<PercentageChangeDisplay
								change={expensesChange}
								invertColor
								className="[&>*>span]:text-xs [&>button]:h-1"
							/>
						)}
					</CardAction>
					<CardTitle className="text-xl">
						<CurrencyValue value={totalExpenses} currency={currency} className="text-xl" />
					</CardTitle>
				</CardHeader>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span className="tracking-wider">Transactions</span>
					</CardDescription>
					<CardTitle className="text-xl">{formatNumber(totalTransactions)}</CardTitle>
				</CardHeader>
			</Card>
		</div>
	);
}
