import { Card, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { cn } from "@hoalu/ui/utils";

import { CurrencyValue } from "#app/components/currency-value.tsx";
import { PercentageChangeDisplay } from "#app/components/percentage-change.tsx";
import { formatNumber } from "#app/helpers/number.ts";
import { trendChangeVariants } from "#app/helpers/percentage-change.ts";

import type { DashboardModel } from "#app/services/dashboard-model.ts";

interface CashFlowSectionProps {
	model: DashboardModel;
}

export function CashFlowSection(props: CashFlowSectionProps) {
	const { model } = props;
	const { currency, range } = model;
	const { stats } = model.cashFlow;

	const showTrend = range.selected === "all" || stats.hasComparison;
	const transactionsDiff = stats.transactions.diff;

	return (
		<div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span className="font-mono tracking-wider">Incomes</span>
						{showTrend && (
							<PercentageChangeDisplay
								change={stats.income.change}
								className="[&>*>span]:text-xs [&>button]:h-1"
							/>
						)}
					</CardDescription>
					<CardTitle className="text-lg font-normal">
						<CurrencyValue value={stats.income.total} currency={currency} className="text-lg" />
					</CardTitle>
				</CardHeader>
			</Card>

			<Card className="@container/card">
				<CardHeader>
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span className="font-mono tracking-wider">Expenses</span>
						{showTrend && (
							<PercentageChangeDisplay
								change={stats.expenses.change}
								invertColor
								className="font-normal [&>*>span]:text-xs [&>button]:h-1"
							/>
						)}
					</CardDescription>
					<CardTitle className="text-lg font-normal">
						<CurrencyValue value={stats.expenses.total} currency={currency} className="text-lg" />
					</CardTitle>
				</CardHeader>
			</Card>

			<Card className="@container/card col-span-2 md:col-span-1">
				<CardHeader>
					<CardDescription className="flex items-center justify-between text-xs uppercase">
						<span className="font-mono tracking-wider">Transactions</span>
						{showTrend && transactionsDiff !== 0 && (
							<span
								className={cn(
									"text-xs font-medium tabular-nums",
									transactionsDiff > 0
										? trendChangeVariants({ trend: "increase" })
										: trendChangeVariants({ trend: "decrease" }),
								)}
							>
								{transactionsDiff > 0 ? "+" : ""}
								{transactionsDiff}
							</span>
						)}
					</CardDescription>
					<CardTitle className="font-mono text-lg font-normal tracking-tight">
						{formatNumber(stats.transactions.count)}
					</CardTitle>
				</CardHeader>
			</Card>
		</div>
	);
}
