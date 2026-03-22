import { customDateRangeAtom, selectDateRangeAtom } from "#app/atoms/filters.ts";
import type { SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import type { IncomeClient } from "#app/components/incomes/use-incomes.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
import { filterDataByRange } from "#app/helpers/date-range.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { TrendingUpIcon, TrendingDownIcon } from "@hoalu/icons/lucide";
import { Badge } from "@hoalu/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@hoalu/ui/card";
import { useAtomValue } from "jotai";

interface CashFlowCardProps {
	incomes: IncomeClient[];
	expenses: SyncedExpense[];
}

export function CashFlowCard({ incomes, expenses }: CashFlowCardProps) {
	const {
		metadata: { currency },
	} = useWorkspace();
	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);

	const filteredIncomes = filterDataByRange(incomes, dateRange, customRange);
	const filteredExpenses = filterDataByRange(expenses, dateRange, customRange);

	const totalIncome = filteredIncomes.reduce(
		(sum, income) => sum + (income.convertedAmount > 0 ? income.convertedAmount : 0),
		0,
	);
	const totalExpenses = filteredExpenses.reduce(
		(sum, expense) => sum + (expense.convertedAmount > 0 ? expense.convertedAmount : 0),
		0,
	);
	const netCashFlow = totalIncome - totalExpenses;

	return (
		<div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid w-full grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Net Cash Flow</CardDescription>
					<CardTitle className="text-xl font-semibold tabular-nums">
						{formatCurrency(netCashFlow, currency)}
					</CardTitle>
					<CardAction>
						<Badge size="lg" variant="outline">
							<TrendingUpIcon />
							+12.5%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Trending up this month <TrendingUpIcon className="size-4" />
					</div>
					<div className="text-muted-foreground">Visitors for the last 6 months</div>
				</CardFooter>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Income</CardDescription>
					<CardTitle className="text-xl font-semibold tabular-nums">
						{formatCurrency(totalIncome, currency)}
					</CardTitle>
					<CardAction>
						<Badge size="lg" variant="outline">
							<TrendingUpIcon />
							+12.5%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Trending up this month <TrendingUpIcon className="size-4" />
					</div>
					<div className="text-muted-foreground">Visitors for the last 6 months</div>
				</CardFooter>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Expenses</CardDescription>
					<CardTitle className="text-xl font-semibold tabular-nums">
						{formatCurrency(totalExpenses, currency)}
					</CardTitle>
					<CardAction>
						<Badge size="lg" variant="outline">
							<TrendingUpIcon />
							+12.5%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Trending up this month <TrendingUpIcon className="size-4" />
					</div>
					<div className="text-muted-foreground">Visitors for the last 6 months</div>
				</CardFooter>
			</Card>
		</div>
	);
}
