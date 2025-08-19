import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { datetime } from "@hoalu/common/datetime";
import { Card, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@hoalu/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@hoalu/ui/select";
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

type DateRange = "7" | "30" | "all";

const dateRangeOptions = [
	{ value: "7" as DateRange, label: "Last 7 days" },
	{ value: "30" as DateRange, label: "Last 30 days" },
	{ value: "all" as DateRange, label: "All time" },
];

function filterDataByRange(data: { date: string; value: number }[], range: DateRange) {
	if (range === "all") return data;

	const days = parseInt(range, 10);
	const today = new Date();
	today.setHours(23, 59, 59, 999); // End of today
	const cutoffDate = new Date(today);
	cutoffDate.setDate(cutoffDate.getDate() - days + 1); // Include today
	cutoffDate.setHours(0, 0, 0, 0); // Start of cutoff day

	// Sort data by date first to ensure proper ordering
	const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

	const filtered = sortedData.filter((item) => {
		const itemDate = new Date(item.date + "T00:00:00"); // Ensure proper date parsing
		const isInRange = itemDate >= cutoffDate && itemDate <= today;
		console.log(`Date ${item.date}: ${isInRange ? "INCLUDED" : "EXCLUDED"}`, {
			itemDate: itemDate.toISOString(),
			value: item.value,
		});
		return isInRange;
	});

	console.log(`Filtered result: ${filtered.length} items`);
	return filtered;
}

export function ExpenseDashboardChart() {
	const [dateRange, setDateRange] = useState<DateRange>("30");
	const stats = useExpenseStats();

	const filteredData = filterDataByRange(stats.aggregation.byDate, dateRange);
	const data = filteredData.slice(-50);

	return (
		<Card className="py-0">
			<CardHeader className="!p-0 flex flex-col sm:flex-row">
				<div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3">
					<CardTitle>Expenses</CardTitle>
				</div>
				<div className="flex items-center px-6 pt-4 pb-3">
					<Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
						<SelectTrigger className="w-[140px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{dateRangeOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
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
