import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { datetime } from "@hoalu/common/datetime";
import { Card, CardContent } from "@hoalu/ui/card";
import { customDateRangeAtom, type DashboardDateRange, selectDateRangeAtom } from "@/atoms/filters";
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
		startDate = datetime.startOfDay(customRange.from);
		endDate = datetime.endOfDay(customRange.to);
	} else if (range === "wtd") {
		// Week to date (Monday to today)
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const dayOfWeek = today.getDay();
		const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, Monday is 1
		const monday = new Date(today);
		monday.setDate(monday.getDate() - daysFromMonday);
		startDate = datetime.startOfDay(monday);
	} else if (range === "mtd") {
		// Month to date (1st of current month to today)
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		startDate = datetime.startOfDay(firstOfMonth);
	} else if (range === "ytd") {
		// Year to date (12 months from today)
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const twelveMonthsAgo = new Date(today);
		twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
		startDate = datetime.startOfDay(twelveMonthsAgo);
	} else {
		const days = parseInt(range, 10);
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const cutoffDate = new Date(today);
		cutoffDate.setDate(cutoffDate.getDate() - days + 1);
		startDate = datetime.startOfDay(cutoffDate);
	}

	return expenses.filter((expense) => {
		const expenseDate = datetime.parse(expense.date, "yyyy-MM-dd", new Date());
		return expenseDate >= startDate && expenseDate <= endDate;
	});
}

export function ExpenseStatsRow() {
	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);
	const { slug } = useWorkspace();
	const { data: expenses } = useSuspenseQuery(expensesQueryOptions(slug));

	const currentPeriodExpenses = filterExpensesByRange(expenses, dateRange, customRange);
	const totalTransactions = currentPeriodExpenses.length;

	const stats = [
		{
			title: "Transactions",
			value: totalTransactions.toString(),
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
		<div className="grid grid-cols-2 gap-4">
			{stats.map((stat, index) => {
				return (
					<Card key={`${stat.title}-${index}`} className="px-6 py-4">
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
