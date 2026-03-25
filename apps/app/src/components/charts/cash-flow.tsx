import { customDateRangeAtom, selectDateRangeAtom } from "#app/atoms/filters.ts";
import { filterDataByRange } from "#app/helpers/date-range.ts";
import { formatNumber } from "#app/helpers/number.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { Card, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { cn } from "@hoalu/ui/utils";
import { useAtomValue } from "jotai";

import { CurrencyValue } from "../currency-value.tsx";

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

	const filteredIncomes = filterDataByRange(props.incomes, dateRange, customRange);
	const filteredExpenses = filterDataByRange(props.expenses, dateRange, customRange);
	const currentPeriodExpenses = filterDataByRange(props.expenses, dateRange, customRange);

	const totalIncome = filteredIncomes.reduce(
		(sum, income) => sum + (income.convertedAmount > 0 ? income.convertedAmount : 0),
		0,
	);
	const totalExpenses = filteredExpenses.reduce(
		(sum, expense) => sum + (expense.convertedAmount > 0 ? expense.convertedAmount : 0),
		0,
	);
	const netCashFlow = totalIncome - totalExpenses;
	const totalTransactions = currentPeriodExpenses.length;

	return (
		<div className="grid w-full grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span>Cash Flow</span>
						{/* <Badge size="sm" variant="outline">
							<TrendingUpIcon />
							+12.5%
						</Badge> */}
					</CardDescription>
					<CardTitle
						className={cn("text-xl", netCashFlow >= 0 ? "text-success" : "text-destructive")}
					>
						<CurrencyValue value={netCashFlow} currency={currency} className="text-xl" />
					</CardTitle>
				</CardHeader>
				{/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Trending up this month <TrendingUpIcon className="size-4" />
					</div>
					<div className="text-muted-foreground">Visitors for the last 6 months</div>
				</CardFooter> */}
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span>Income</span>
						{/* <Badge size="sm" variant="outline">
							<TrendingUpIcon />
							+12.5%
						</Badge> */}
					</CardDescription>
					<CardTitle className="text-xl">
						<CurrencyValue value={totalIncome} currency={currency} className="text-xl" />
					</CardTitle>
				</CardHeader>
				{/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Trending up this month <TrendingUpIcon className="size-4" />
					</div>
					<div className="text-muted-foreground">Visitors for the last 6 months</div>
				</CardFooter> */}
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span>Expenses</span>
						{/* <Badge size="sm" variant="outline">
							<TrendingUpIcon />
							+12.5%
						</Badge> */}
					</CardDescription>
					<CardTitle className="text-xl">
						<CurrencyValue value={totalExpenses} currency={currency} className="text-xl" />
					</CardTitle>
				</CardHeader>
				{/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
					<div className="line-clamp-1 flex gap-2 font-medium">
						Trending up this month <TrendingUpIcon className="size-4" />
					</div>
					<div className="text-muted-foreground">Visitors for the last 6 months</div>
				</CardFooter> */}
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span>Transactions</span>
						{/* <Badge size="sm" variant="outline">
							<TrendingUpIcon />
							+12.5%
						</Badge> */}
					</CardDescription>
					<CardTitle className="text-xl">{formatNumber(totalTransactions)}</CardTitle>
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
