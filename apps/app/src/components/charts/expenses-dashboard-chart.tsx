import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { datetime } from "@hoalu/common/datetime";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@hoalu/ui/chart";
import { useExpenseStats } from "@/hooks/use-expenses";

const chartConfig = {
	value: {
		label: "Total expense",
	},
	date: {
		label: "Expense",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

export function ExpenseDashboardChart() {
	const stats = useExpenseStats();
	const data = stats.aggregation.byDate.slice(0, 30).reverse();

	return (
		<Card className="py-0">
			<CardHeader className="!p-0 flex flex-col sm:flex-row">
				<div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3">
					<CardTitle>Expenses</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="px-2 sm:p-6">
				<ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
					<BarChart
						accessibilityLayer
						data={data}
						margin={{
							left: 12,
							right: 12,
						}}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							minTickGap={32}
							tickFormatter={(value) => {
								return datetime.format(new Date(value), "dd/MM/yyyy");
							}}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									className="w-[150px]"
									nameKey="value"
									labelFormatter={(value) => {
										return datetime.format(new Date(value), "dd/MM/yyyy");
									}}
								/>
							}
						/>
						<Bar dataKey="value" fill={`var(--color-date)`} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
