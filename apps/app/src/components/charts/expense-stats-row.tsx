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
