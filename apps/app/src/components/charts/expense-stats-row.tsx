import { useAtomValue } from "jotai";

import { Card, CardContent } from "@hoalu/ui/card";

import { customDateRangeAtom, selectDateRangeAtom } from "#app/atoms/filters.ts";
import { filterDataByRange } from "#app/helpers/date-range.ts";
import { useLiveQueryExpenses } from "#app/hooks/use-db.ts";

export function ExpenseStatsRow() {
	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);
	const expenses = useLiveQueryExpenses();

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
