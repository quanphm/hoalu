import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { Card, CardContent } from "@hoalu/ui/card";
import { customDateRangeAtom, selectDateRangeAtom } from "@/atoms/filters";
import { filterDataByRange } from "@/helpers/date-range";
import { useWorkspace } from "@/hooks/use-workspace";
import { expensesQueryOptions } from "@/services/query-options";

export function ExpenseStatsRow() {
	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);
	const { slug } = useWorkspace();
	const { data: expenses } = useSuspenseQuery(expensesQueryOptions(slug));

	const currentPeriodExpenses = filterDataByRange(expenses, dateRange, customRange);
	const totalTransactions = currentPeriodExpenses.length;

	const stats = [
		{
			title: "Days",
			value:
				currentPeriodExpenses.length > 0
					? new Set(currentPeriodExpenses.map((e) => e.date)).size.toString()
					: "0",
		},
		{
			title: "Transactions",
			value: totalTransactions.toString(),
		},
	];

	return (
		<Card className="w-full px-6 py-4">
			<CardContent className="grid grid-cols-3 gap-6 p-0">
				{stats.map((stat) => {
					return (
						<div key={stat.title} className="flex flex-col gap-2">
							<span className="font-medium text-muted-foreground text-sm">{stat.title}</span>
							<span className="font-bold text-2xl">{stat.value}</span>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
