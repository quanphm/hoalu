import { customDateRangeAtom, selectDateRangeAtom } from "#app/atoms/filters.ts";
import type { SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import { filterDataByRange } from "#app/helpers/date-range.ts";
import { formatNumber } from "#app/helpers/number.ts";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	// CardContent,
	// CardFooter,
	// CardAction,
} from "@hoalu/ui/card";
import { useAtomValue } from "jotai";

interface ExpenseStatsRowProps {
	expenses: SyncedExpense[];
}

export function ExpenseStatsRow(props: ExpenseStatsRowProps) {
	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);

	const currentPeriodExpenses = filterDataByRange(props.expenses, dateRange, customRange);
	const totalTransactions = currentPeriodExpenses.length;

	return (
		<div className="grid w-full grid-cols-1 gap-4 *:data-[slot=card]:py-2.5 md:grid-cols-2">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Days</CardDescription>
					<CardTitle className="text-xl">
						{formatNumber(
							currentPeriodExpenses.length > 0
								? new Set(currentPeriodExpenses.map((e) => e.date)).size
								: 0,
						)}
					</CardTitle>
				</CardHeader>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Transactions</CardDescription>
					<CardTitle className="text-xl">{formatNumber(totalTransactions)}</CardTitle>
					{/* <CardAction>
						<Badge size="lg" variant="outline">
							<TrendingUpIcon />
							+12.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				{/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Trending up this month <TrendingUpIcon className="size-4" />
					</div>
					<div className="text-muted-foreground">Visitors for the last 6 months</div>
				</CardFooter> */}
			</Card>
		</div>
	);
}
