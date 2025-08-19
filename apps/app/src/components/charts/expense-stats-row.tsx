import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { Card, CardContent } from "@hoalu/ui/card";
import { customDateRangeAtom, type DashboardDateRange, selectDateRangeAtom } from "@/atoms/filters";
import { formatCurrency } from "@/helpers/currency";
import { useWorkspace } from "@/hooks/use-workspace";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";
import { expensesQueryOptions } from "@/services/query-options";

function filterExpensesByRange(
	expenses: ExpenseWithClientConvertedSchema[],
	range: DashboardDateRange,
	customRange?: { from: Date; to: Date },
) {
	if (range === "all") return expenses;

	let startDate: Date;
	let endDate: Date;

	if (range === "custom" && customRange) {
		startDate = new Date(customRange.from);
		endDate = new Date(customRange.to);
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);
	} else {
		const days = parseInt(range, 10);
		const today = new Date();
		today.setHours(23, 59, 59, 999);
		const cutoffDate = new Date(today);
		cutoffDate.setDate(cutoffDate.getDate() - days + 1);
		cutoffDate.setHours(0, 0, 0, 0);
		startDate = cutoffDate;
		endDate = today;
	}

	return expenses.filter((expense) => {
		const expenseDate = new Date(`${expense.date}T00:00:00`);
		return expenseDate >= startDate && expenseDate <= endDate;
	});
}

export function ExpenseStatsRow() {
	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);
	const { slug } = useWorkspace();
	const {
		metadata: { currency },
	} = useWorkspace();
	const { data: expenses } = useSuspenseQuery(expensesQueryOptions(slug));

	const currentPeriodExpenses = filterExpensesByRange(expenses, dateRange, customRange);

	const totalExpenses = currentPeriodExpenses.reduce(
		(sum, expense) => sum + (expense.convertedAmount > 0 ? expense.convertedAmount : 0),
		0,
	);
	const totalTransactions = currentPeriodExpenses.length;
	const avgPerTransaction = totalTransactions > 0 ? totalExpenses / totalTransactions : 0;

	const stats = [
		{
			title: "Total Expenses",
			value: formatCurrency(totalExpenses, currency),
		},
		{
			title: "Transactions",
			value: totalTransactions.toString(),
		},
		{
			title: "Avg per Transaction",
			value: formatCurrency(avgPerTransaction, currency),
		},
		{
			title: "Days",
			value:
				currentPeriodExpenses.length > 0
					? new Set(currentPeriodExpenses.map((e) => e.date)).size.toString()
					: "0",
		},
	];

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{stats.map((stat, index) => {
				return (
					<Card key={index} className="p-4">
						<CardContent className="p-0">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className="font-medium text-muted-foreground text-sm">{stat.title}</span>
								</div>
							</div>
							<div className="mt-2">
								<div className="font-bold text-2xl">{stat.value}</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
