import { customDateRangeAtom, selectDateRangeAtom } from "#app/atoms/filters.ts";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import { BoxAnimations } from "#app/components/orb-motion.tsx";
import { PercentageChangeDisplay } from "#app/components/percentage-change.tsx";
import { calculateComparisonDateRange, filterDataByRange } from "#app/helpers/date-range.ts";
import { formatNumber } from "#app/helpers/number.ts";
import { calculatePercentageChange } from "#app/helpers/percentage-change.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { datetime, TIME_IN_MILLISECONDS } from "@hoalu/common/datetime";
import { Card, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { cn } from "@hoalu/ui/utils";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

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
	const totalTransactions = filteredExpenses.length + filteredIncomes.length;

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
		prevTransactions = prevExp.length + prevIncomes.length;
	}

	const incomeChange = calculatePercentageChange(totalIncome, prevIncome, currency);
	const expensesChange = calculatePercentageChange(totalExpenses, prevExpenses, currency);
	const cashFlowChange = calculatePercentageChange(netCashFlow, prevNetCashFlow, currency);
	const transactionsDiff = totalTransactions - prevTransactions;

	const periodInfo = useMemo(() => {
		console.log(dateRange);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		let start: Date;
		let end: Date = new Date(today);

		if (dateRange === "all") return { label: "All time", totalDays: null };

		if (dateRange === "custom" && customRange) {
			start = new Date(customRange.from);
			end = new Date(customRange.to);
			start.setHours(0, 0, 0, 0);
			end.setHours(0, 0, 0, 0);
		} else if (dateRange === "mtd") {
			start = new Date(today.getFullYear(), today.getMonth(), 1);
		} else if (dateRange === "ytd") {
			start = new Date(today.getFullYear(), 0, 1);
		} else if (dateRange === "wtd") {
			const dow = today.getDay();
			start = new Date(today);
			start.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
		} else if (dateRange.endsWith("m")) {
			const months = parseInt(dateRange, 10);
			const today = new Date();

			// End date is last day of current month
			// Using day 0 of next month gives us the last day of current month
			// This handles months with different lengths (28-31 days) automatically
			const lastDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
			end = datetime.endOfDay(lastDayOfCurrentMonth);

			// Start date is first day of the month (months - 1) ago
			// Example: for 12 months in Jan 2026: month 0 - (12 - 1) = month -11 = Feb 2025
			// JavaScript Date handles negative month values correctly (rolls back years)
			// Using day 1 avoids leap year issues (e.g., Feb 29 → Mar 1 in non-leap years)
			const firstDayOfStartMonth = new Date(
				today.getFullYear(),
				today.getMonth() - (months - 1),
				1, // Always use day 1 to avoid month overflow edge cases
			);
			start = datetime.startOfDay(firstDayOfStartMonth);
		} else {
			const days = parseInt(dateRange, 10) || 30;
			start = new Date(today);
			start.setDate(today.getDate() - days + 1);
		}

		const totalDays = Math.round((end.getTime() - start.getTime()) / TIME_IN_MILLISECONDS.DAY) + 1;

		const y = Math.floor(totalDays / 365);
		const afterYears = totalDays - y * 365;
		const m = Math.floor(afterYears / 30);
		const d = afterYears - m * 30;

		const parts: string[] = [];
		if (y > 0) parts.push(`${y}Y`);
		if (m > 0) parts.push(`${m}M`);
		if (d > 0) parts.push(`${d}D`);

		return { label: parts.length > 0 ? parts.join(" ") : "1D", totalDays };
	}, [dateRange, customRange]);

	const showTrend = dateRange === "all" || comparisonRange !== null;

	return (
		<div
			className={cn(
				"grid w-full grid-cols-2 md:grid-cols-5",
				"*:data-[slot=card]:border-l-0 *:data-[slot=card]:last:border-r-transparent *:data-[slot=card]:md:py-3",
			)}
		>
			<Card className="@container/card relative overflow-hidden">
				{showTrend && <BoxAnimations status={cashFlowChange.status} />}
				<CardHeader>
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span className="font-mono tracking-wider">Cash Flow</span>
						{showTrend && (
							<PercentageChangeDisplay
								change={cashFlowChange}
								className="[&>*>span]:text-xs [&>button]:h-1"
							/>
						)}
					</CardDescription>
					<CardTitle className="text-xl">
						<CurrencyValue value={netCashFlow} currency={currency} className="text-xl" />
					</CardTitle>
				</CardHeader>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span className="font-mono tracking-wider">Income</span>
						{showTrend && (
							<PercentageChangeDisplay
								change={incomeChange}
								className="[&>*>span]:text-xs [&>button]:h-1"
							/>
						)}
					</CardDescription>
					<CardTitle className="text-xl">
						<CurrencyValue value={totalIncome} currency={currency} className="text-xl" />
					</CardTitle>
				</CardHeader>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span className="font-mono tracking-wider">Expenses</span>
						{showTrend && (
							<PercentageChangeDisplay
								change={expensesChange}
								invertColor
								className="[&>*>span]:text-xs [&>button]:h-1"
							/>
						)}
					</CardDescription>
					<CardTitle className="text-xl">
						<CurrencyValue value={totalExpenses} currency={currency} className="text-xl" />
					</CardTitle>
				</CardHeader>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span className="font-mono tracking-wider">Transactions</span>
						{showTrend && transactionsDiff !== 0 && (
							<span
								className={cn(
									"text-xs font-medium tabular-nums",
									transactionsDiff > 0 ? "text-success" : "text-destructive",
								)}
							>
								{transactionsDiff > 0 ? "+" : ""}
								{transactionsDiff}
							</span>
						)}
					</CardDescription>
					<CardTitle className="font-mono text-xl tracking-tight tabular-nums">
						{formatNumber(totalTransactions)}
					</CardTitle>
				</CardHeader>
			</Card>

			<Card className="@container/card hidden md:block">
				<CardHeader>
					<CardDescription className="text-xs tracking-wider uppercase">Period</CardDescription>
					<CardTitle className="font-mono text-xl tracking-tight tabular-nums">
						{periodInfo.label}
						{/* {periodInfo.totalDays !== null && (
							<span className="text-muted-foreground ml-1.5 text-sm font-normal">
								({periodInfo.totalDays})
							</span>
						)} */}
					</CardTitle>
				</CardHeader>
			</Card>
		</div>
	);
}
