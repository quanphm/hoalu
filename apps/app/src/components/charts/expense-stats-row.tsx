import { customDateRangeAtom, selectDateRangeAtom } from "#app/atoms/filters.ts";
import type { SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import { filterDataByRange } from "#app/helpers/date-range.ts";
import { formatNumber } from "#app/helpers/number.ts";
import { Card, CardContent } from "@hoalu/ui/card";
import { useAtomValue } from "jotai";

interface ExpenseStatsRowProps {
	expenses: SyncedExpense[];
}

export function ExpenseStatsRow(props: ExpenseStatsRowProps) {
	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);

	const currentPeriodExpenses = filterDataByRange(props.expenses, dateRange, customRange);
	const totalTransactions = currentPeriodExpenses.length;

	const stats = [
		{
			title: "Days",
			value: formatNumber(
				currentPeriodExpenses.length > 0
					? new Set(currentPeriodExpenses.map((e) => e.date)).size
					: 0,
			),
		},
		{
			title: "Transactions",
			value: formatNumber(totalTransactions),
		},
	];

	return (
		<Card className="w-full px-6 py-4">
			<CardContent className="grid grid-cols-3 gap-6 p-0">
				{stats.map((stat) => {
					return (
						<div key={stat.title} className="flex flex-col gap-2">
							<span className="text-muted-foreground text-sm font-medium">{stat.title}</span>
							<span className="text-2xl font-bold">{stat.value}</span>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
