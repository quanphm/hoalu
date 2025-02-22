import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@hoalu/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const barChartData = [
	{ month: "January", spending: 186 },
	{ month: "February", spending: 305 },
	{ month: "March", spending: 0 },
	{ month: "April", spending: 0 },
	{ month: "May", spending: 0 },
	{ month: "June", spending: 0 },
	{ month: "July", spending: 0 },
	{ month: "August", spending: 0 },
	{ month: "September", spending: 0 },
	{ month: "October", spending: 0 },
	{ month: "November", spending: 0 },
	{ month: "December", spending: 0 },
];

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "var(--chart-1)",
	},
	spending: {
		color: "var(--primary)",
	},
} satisfies ChartConfig;

export function ExpensesStats() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Expenses</CardTitle>
				<CardDescription>January - December 2025</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="min-h-[200px] w-full">
					<BarChart accessibilityLayer data={barChartData}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="month"
							tickLine={false}
							tickMargin={20}
							axisLine={false}
							tickFormatter={(value) => value.slice(0, 3)}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Bar dataKey="spending" fill="var(--color-spending)" radius={4} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
