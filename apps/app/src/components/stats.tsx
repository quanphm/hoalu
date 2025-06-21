import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { TrendingUpIcon } from "@hoalu/icons/lucide";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@hoalu/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@hoalu/ui/chart";

const areaChartData = [
	{ month: "January", desktop: 186 },
	{ month: "February", desktop: 305 },
	{ month: "March", desktop: 237 },
	{ month: "April", desktop: 73 },
	{ month: "May", desktop: 209 },
	{ month: "June", desktop: 214 },
];

const barChartData = [
	{ month: "January", spending: 186 },
	{ month: "February", spending: 305 },
	{ month: "March", spending: 237 },
	{ month: "April", spending: 73 },
	{ month: "May", spending: 209 },
	{ month: "June", spending: 214 },
	{ month: "July", spending: 214 },
	{ month: "August", spending: 214 },
	{ month: "September", spending: 214 },
	{ month: "October", spending: 214 },
	{ month: "November", spending: 214 },
	{ month: "December", spending: 214 },
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

export function Stats() {
	return (
		<>
			<div className="col-span-6">
				<Card>
					<CardHeader>
						<CardTitle>Area Chart</CardTitle>
						<CardDescription>Showing total visitors for the last 6 months</CardDescription>
					</CardHeader>
					<CardContent>
						<ChartContainer config={chartConfig}>
							<AreaChart
								accessibilityLayer
								data={areaChartData}
								margin={{
									left: 12,
									right: 12,
								}}
							>
								<CartesianGrid vertical={false} />
								<XAxis
									dataKey="month"
									tickLine={false}
									axisLine={false}
									tickMargin={8}
									tickFormatter={(value) => value.slice(0, 3)}
								/>
								<ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
								<Area
									dataKey="desktop"
									type="natural"
									fill="var(--color-desktop)"
									fillOpacity={0.4}
									stroke="var(--color-desktop)"
								/>
							</AreaChart>
						</ChartContainer>
					</CardContent>
					<CardFooter>
						<div className="flex w-full items-start gap-2 text-sm">
							<div className="grid gap-2">
								<div className="flex items-center gap-2 font-medium leading-none">
									Trending up by 5.2% this month <TrendingUpIcon className="size-4" />
								</div>
								<div className="flex items-center gap-2 text-muted-foreground leading-none">
									January - June 2024
								</div>
							</div>
						</div>
					</CardFooter>
				</Card>
			</div>

			<div className="col-span-6">
				<Card>
					<CardHeader>
						<CardTitle>Spending</CardTitle>
						<CardDescription>January - December 2024</CardDescription>
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
					<CardFooter className="flex-col items-start gap-2 text-sm">
						<div className="flex gap-2 font-medium leading-none">
							Trending up by 5.2% this month <TrendingUpIcon className="size-4" />
						</div>
						<div className="flex items-center gap-2 text-muted-foreground leading-none">
							January - June 2024
						</div>
					</CardFooter>
				</Card>
			</div>
		</>
	);
}
