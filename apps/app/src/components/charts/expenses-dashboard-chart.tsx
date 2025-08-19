import { useAtomValue } from "jotai";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { datetime } from "@hoalu/common/datetime";
import { Card, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@hoalu/ui/chart";
import { customDateRangeAtom, type DashboardDateRange, selectDateRangeAtom } from "@/atoms/filters";
import { useExpenseStats } from "@/hooks/use-expenses";

const chartConfig = {
	value: {
		label: "Total expense",
	},
	date: {
		label: "Expense",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

function filterDataByRange(
	data: { date: string; value: number }[],
	range: DashboardDateRange,
	customRange?: { from: Date; to: Date },
) {
	if (range === "all") return data;

	let startDate: Date;
	let endDate: Date;

	if (range === "custom" && customRange) {
		startDate = new Date(customRange.from);
		endDate = new Date(customRange.to);
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);
	} else {
		const days = parseInt(range, 10);
		const today = new Date();
		today.setHours(23, 59, 59, 999);
		const cutoffDate = new Date(today);
		cutoffDate.setDate(cutoffDate.getDate() - days + 1);
		cutoffDate.setHours(0, 0, 0, 0);
		startDate = cutoffDate;
		endDate = today;
	}

	// Sort data by date first to ensure proper ordering
	const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

	const filtered = sortedData.filter((item) => {
		const itemDate = new Date(item.date);
		return itemDate >= startDate && itemDate <= endDate;
	});

	return filtered;
}

export function ExpenseDashboardChart() {
	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);
	const stats = useExpenseStats();

	const filteredData = filterDataByRange(stats.aggregation.byDate, dateRange, customRange);
	const data = filteredData.slice(-50);

	return (
		<Card className="py-0">
			<CardHeader className="!p-0 flex flex-col sm:flex-row">
				<div className="flex flex-1 flex-col justify-center gap-2 px-6 pt-4">
					<CardTitle>Expenses</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="px-2 sm:p-6">
				{data.length === 0 ? (
					<div className="flex h-[250px] items-center justify-center text-muted-foreground">
						No data to display
					</div>
				) : (
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
				)}
			</CardContent>
		</Card>
	);
}
