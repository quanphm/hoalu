import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@hoalu/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@hoalu/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const chartData = [
	{ month: "January", desktop: 186, mobile: 80 },
	{ month: "February", desktop: 305, mobile: 200 },
	{ month: "March", desktop: 237, mobile: 120 },
	{ month: "April", desktop: 73, mobile: 190 },
	{ month: "May", desktop: 209, mobile: 130 },
	{ month: "June", desktop: 214, mobile: 140 },
	{ month: "July", desktop: 214, mobile: 140 },
	{ month: "August", desktop: 214, mobile: 140 },
	{ month: "September", desktop: 214, mobile: 140 },
	{ month: "October", desktop: 214, mobile: 140 },
	{ month: "November", desktop: 214, mobile: 140 },
	{ month: "December", desktop: 214, mobile: 140 },
];

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "hsl(var(--chart-1))",
	},
	mobile: {
		label: "Mobile",
		color: "hsl(var(--chart-2))",
	},
} satisfies ChartConfig;

export function Chart() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Bar Chart - Multiple</CardTitle>
				<CardDescription>January - December 2024</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="min-h-[200px] w-full">
					<BarChart accessibilityLayer data={chartData}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="month"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							tickFormatter={(value) => value.slice(0, 3)}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
						<Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
