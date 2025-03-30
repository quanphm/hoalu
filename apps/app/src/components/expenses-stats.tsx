import { Card, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@hoalu/ui/chart";
import { RadioGroup, RadioGroupItem } from "@hoalu/ui/radio-group";
import { cn } from "@hoalu/ui/utils";
import { useId, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const dailyData = [
	{ date: "2025-02-21", value: 1150200 },
	{ date: "2025-02-22", value: 1157400 },
	{ date: "2025-02-23", value: 1149800 },
	{ date: "2025-02-24", value: 1143500 },
	{ date: "2025-02-25", value: 1152700 },
	{ date: "2025-02-26", value: 1168900 },
	{ date: "2025-02-27", value: 1162300 },
	{ date: "2025-02-28", value: 1175600 },
	{ date: "2025-03-01", value: 1169200 },
	{ date: "2025-03-02", value: 1176800 },
	{ date: "2025-03-03", value: 1182500 },
	{ date: "2025-03-04", value: 1167300 },
	{ date: "2025-03-05", value: 1160100 },
	{ date: "2025-03-06", value: 1178600 },
	{ date: "2025-03-07", value: 1191200 },
	{ date: "2025-03-08", value: 1183500 },
	{ date: "2025-03-09", value: 1175100 },
	{ date: "2025-03-10", value: 1182700 },
	{ date: "2025-03-11", value: 1194300 },
	{ date: "2025-03-12", value: 1185800 },
	{ date: "2025-03-13", value: 1186002 },
	{ date: "2025-03-14", value: 1174200 },
	{ date: "2025-03-15", value: 1181700 },
	{ date: "2025-03-16", value: 1186800 },
	{ date: "2025-03-17", value: 1187400 },
	{ date: "2025-03-18", value: 1200200 },
	{ date: "2025-03-19", value: 1194100 },
	{ date: "2025-03-20", value: 1206000 },
];

const weeklyData = [
	{ date: "2024-12-13", value: 1132500 },
	{ date: "2024-12-20", value: 1127800 },
	{ date: "2024-12-27", value: 1143200 },
	{ date: "2025-01-03", value: 1138900 },
	{ date: "2025-01-10", value: 1145600 },
	{ date: "2025-01-17", value: 1156700 },
	{ date: "2025-01-24", value: 1149300 },
	{ date: "2025-01-31", value: 1162800 },
	{ date: "2025-02-07", value: 1158400 },
	{ date: "2025-02-14", value: 1167900 },
	{ date: "2025-02-21", value: 1172300 },
	{ date: "2025-02-28", value: 1150200 },
	{ date: "2025-03-06", value: 1175600 },
	{ date: "2025-03-13", value: 1178600 },
	{ date: "2025-03-20", value: 1186002 },
	{ date: "2025-03-27", value: 1206000 },
];

const monthlyData = [
	{ date: "2024-03-01", value: 1148500 },
	{ date: "2024-04-01", value: 1145800 },
	{ date: "2024-05-01", value: 1138200 },
	{ date: "2024-06-01", value: 1138900 },
	{ date: "2024-07-01", value: 1132600 },
	{ date: "2024-08-01", value: 1136700 },
	{ date: "2024-09-01", value: 1138300 },
	{ date: "2024-10-01", value: 1132800 },
	{ date: "2024-11-01", value: 1148400 },
	{ date: "2024-12-01", value: 1142900 },
	{ date: "2025-01-01", value: 1157900 },
	{ date: "2025-02-01", value: 1162300 },
	{ date: "2025-03-01", value: 1169200 },
];

const yearlyData = [
	{ date: "2020-01-01", value: 892600 },
	{ date: "2021-01-01", value: 916700 },
	{ date: "2022-01-01", value: 988300 },
	{ date: "2023-01-01", value: 1022800 },
	{ date: "2024-01-01", value: 1128400 },
	{ date: "2025-01-01", value: 1169200 },
];

const formatDate = (dateStr: string, period: string) => {
	const date = new Date(dateStr);
	if (period === "1d") {
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	}
	if (period === "7d") {
		return date.toLocaleDateString("en-US", {
			// year: "numeric",
			month: "short",
			day: "numeric",
		});
	}
	if (period === "1m") {
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
		});
	}
	if (period === "1y") {
		return date.toLocaleDateString("en-US", { year: "numeric" });
	}
	return dateStr;
};

const chartConfig = {
	value: {
		label: "Value",
		color: "var(--chart-1)",
	},
	projected: {
		label: "Projected",
		color: "var(--chart-3)",
	},
} satisfies ChartConfig;

const TIME_PERIOD_OPTIONS = ["1d", "7d", "1m", "1y"];

const ViewOption = ({ id, value }: { id: string; value: string }) => {
	return (
		<label
			className="relative z-10 inline-flex h-full min-w-8 cursor-pointer select-none items-center justify-center whitespace-nowrap px-2 text-foreground uppercase transition-colors has-data-[state=unchecked]:text-muted-foreground"
			htmlFor={`${id}-${value}`}
		>
			{value}
			<RadioGroupItem id={`${id}-${value}`} value={value} className="sr-only" />
		</label>
	);
};

export function ExpensesStats() {
	const id = useId();
	const [selectedValue, setSelectedValue] = useState("1d");
	const selectedIndex = TIME_PERIOD_OPTIONS.indexOf(selectedValue);

	const getChartDataForTimePeriod = () => {
		switch (selectedValue) {
			case "1d":
				return dailyData;
			case "7d":
				return weeklyData;
			case "1m":
				return monthlyData;
			default:
				return yearlyData;
		}
	};
	const chartDataToUse = getChartDataForTimePeriod();

	return (
		<Card className="gap-4">
			<CardHeader>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="space-y-0.5">
						<CardTitle>Expenses</CardTitle>
						<div className="mb-1 font-bold text-3xl">
							<span className="text-muted-foreground text-xl">$</span>
							1,327,349.19
						</div>
						<div className="font-medium text-emerald-500 text-sm">↗ $2,849.27 (+4%)</div>
					</div>
					<div className="inline-flex h-8 shrink-0 rounded-full bg-background p-1">
						<RadioGroup
							value={selectedValue}
							onValueChange={setSelectedValue}
							className={cn(
								"group relative inline-grid grid-cols-(--grid-cols) items-center gap-0 font-medium text-xs after:absolute after:inset-y-0 after:w-(--swidth) after:rounded-full after:duration-300 after:[transition-timing-function:cubic-bezier(0.16,1,0.3,1)] [&:after]:translate-x-[calc(var(--selected-index)*100%)]",
								"after:bg-accent",
								"dark:after:bg-accent dark:after:shadow-[0_1px_2px_0_rgb(0_0_0/.05),inset_0_1px_0_0_rgb(255_255_255/.12)]",
							)}
							data-state={selectedValue}
							style={
								{
									"--selected-index": selectedIndex,
									"--grid-cols": `repeat(${TIME_PERIOD_OPTIONS.length}, 1fr)`,
									"--swidth": `${(1 / TIME_PERIOD_OPTIONS.length) * 100}%`,
								} as React.CSSProperties
							}
						>
							{TIME_PERIOD_OPTIONS.map((value) => (
								<ViewOption key={value} id={id} value={value} />
							))}
						</RadioGroup>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-70 w-full [&_.recharts-cartesian-axis-line]:stroke-border dark:[&_.recharts-cartesian-axis-line]:stroke-muted [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border dark:[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-(--chart-1)/10 [&_.recharts-rectangle.recharts-tooltip-inner-cursor]:fill-(--chart-1)/25"
				>
					<BarChart
						accessibilityLayer
						key={selectedValue}
						data={chartDataToUse}
						margin={{ right: 12, top: 12 }}
					>
						<CartesianGrid vertical={false} strokeDasharray="2 2" />
						<XAxis
							dataKey={"date"}
							tickLine={false}
							tickMargin={12}
							minTickGap={40}
							tickFormatter={(value) => formatDate(value, selectedValue)}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							allowDataOverflow={true}
							domain={["dataMin - 1000", "dataMax + 1000"]}
							tickFormatter={(value) => {
								if (value === 0) return "$0.00";
								return `$${(value / 1000).toLocaleString("en-US", { maximumFractionDigits: 2 })}k`;
							}}
						/>
						<ChartTooltip
							isAnimationActive={false}
							offset={20}
							content={<ChartTooltipContent hideIndicator />}
							formatter={(value) =>
								`$${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`
							}
						/>
						<Bar dataKey="value" fill="var(--color-value)" radius={2} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
