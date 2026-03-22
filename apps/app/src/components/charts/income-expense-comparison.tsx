import { customDateRangeAtom, selectDateRangeAtom } from "#app/atoms/filters.ts";
import type { SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import type { SyncedIncome } from "#app/components/incomes/use-incomes.ts";
import { filterDataByRange } from "#app/helpers/date-range.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { datetime } from "@hoalu/common/datetime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@hoalu/ui/chart";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts";

const chartConfig = {
	income: {
		label: "Income",
		color: "#22c55e", // green-500
	},
	expenses: {
		label: "Expenses",
		color: "#ef4444", // red-500
	},
} satisfies ChartConfig;

interface IncomeExpenseComparisonProps {
	incomes: SyncedIncome[];
	expenses: SyncedExpense[];
}

interface MonthlyData {
	month: string;
	income: number;
	expenses: number;
}

export function IncomeExpenseComparison({ incomes, expenses }: IncomeExpenseComparisonProps) {
	const {
		metadata: { currency },
	} = useWorkspace();
	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);

	const filteredIncomes = filterDataByRange(incomes, dateRange, customRange);
	const filteredExpenses = filterDataByRange(expenses, dateRange, customRange);

	const data: MonthlyData[] = useMemo(() => {
		// Group by month
		const monthlyMap = new Map<string, { income: number; expenses: number }>();

		// Process incomes
		for (const income of filteredIncomes) {
			const month = datetime.format(income.date, "yyyy-MM");
			const existing = monthlyMap.get(month) || { income: 0, expenses: 0 };
			existing.income += income.convertedAmount > 0 ? income.convertedAmount : 0;
			monthlyMap.set(month, existing);
		}

		// Process expenses
		for (const expense of filteredExpenses) {
			const month = datetime.format(expense.date, "yyyy-MM");
			const existing = monthlyMap.get(month) || { income: 0, expenses: 0 };
			existing.expenses += expense.convertedAmount > 0 ? expense.convertedAmount : 0;
			monthlyMap.set(month, existing);
		}

		// Convert to array and sort by month
		return Array.from(monthlyMap.entries())
			.map(([month, values]) => ({
				month: datetime.format(`${month}-01`, "MMM yyyy"),
				income: Math.round(values.income),
				expenses: Math.round(values.expenses),
			}))
			.sort((a, b) => {
				const dateA = new Date(a.month);
				const dateB = new Date(b.month);
				return dateA.getTime() - dateB.getTime();
			});
	}, [filteredIncomes, filteredExpenses]);

	const totals = useMemo(() => {
		const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
		const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);
		return { totalIncome, totalExpenses };
	}, [data]);

	if (data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Income vs Expenses</CardTitle>
					<CardDescription>Compare your income and expenses over time</CardDescription>
				</CardHeader>
				<CardContent className="flex h-[300px] items-center justify-center">
					<p className="text-muted-foreground">No data available for the selected period</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Income vs Expenses</CardTitle>
				<CardDescription>
					Total Income: {currency} {totals.totalIncome.toLocaleString()} | Total Expenses:{" "}
					{currency} {totals.totalExpenses.toLocaleString()}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[300px] w-full">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" vertical={false} />
							<XAxis
								dataKey="month"
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								fontSize={12}
							/>
							<YAxis
								tickLine={false}
								axisLine={false}
								tickMargin={8}
								fontSize={12}
								tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value)}
							/>
							<ChartTooltip
								content={({ active, payload, label }) => {
									if (active && payload && payload.length) {
										return (
											<div className="bg-background rounded-lg border p-2 shadow-sm">
												<p className="font-medium">{label}</p>
												{payload.map((entry, index) => (
													<p key={`${entry.dataKey}-${index}`} className="text-sm">
														<span
															className="mr-2 inline-block h-2 w-2 rounded-full"
															style={{ backgroundColor: entry.color }}
														/>
														{entry.name}: {currency} {Number(entry.value).toLocaleString()}
													</p>
												))}
											</div>
										);
									}
									return null;
								}}
							/>
							<Legend />
							<Bar
								dataKey="income"
								name="Income"
								fill="var(--color-income)"
								radius={[4, 4, 0, 0]}
							/>
							<Bar
								dataKey="expenses"
								name="Expenses"
								fill="var(--color-expenses)"
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
