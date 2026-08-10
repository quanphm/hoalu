import { datetime } from "@hoalu/datetime/datetime";
import { TrendingDownIcon, TrendingUpIcon } from "@hoalu/icons/tabler";
import { Card, CardContent, CardDescription, CardHeader } from "@hoalu/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@hoalu/ui/chart";
import { cn } from "@hoalu/ui/utils";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { setSyncedDateRange } from "#app/atoms/filters.ts";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import { PercentageChangeDisplay } from "#app/components/percentage-change.tsx";
import { formatCompactNumber } from "#app/helpers/number.ts";
import { trendChangeVariants } from "#app/helpers/percentage-change.ts";

import type { CashFlowPoint, DashboardModel, SeriesBucket } from "#app/services/dashboard-model.ts";

const chartConfig = {
	balance: {
		color: "var(--primary)",
	},
} satisfies ChartConfig;

interface CashFlowChartProps {
	model: DashboardModel;
}

export function CashFlowChart(props: CashFlowChartProps) {
	const { model } = props;
	const { currency, range } = model;
	const data = model.cashFlow.series;
	const isMonthlyBucket = range.bucket === "month";

	const finalBalance = data.length > 0 ? data[data.length - 1].balance : 0;
	const startBalance = data.length > 0 ? data[0].balance : 0;
	const isPositiveTrend = finalBalance >= startBalance;
	const trendColor = isPositiveTrend ? "var(--success)" : "var(--destructive)";
	const [hoveredDataPoint, setHoveredDataPoint] = useState<CashFlowPoint | null>(null);
	const displayBalance = hoveredDataPoint?.balance ?? finalBalance;
	const displayNet = hoveredDataPoint?.net ?? null;
	const isHovering = hoveredDataPoint !== null;

	const netChange = model.cashFlow.stats.net.change;
	const comparisonText = model.cashFlow.stats.comparisonText;
	const handleComparisonClick = () => {
		if (range.comparison) {
			setSyncedDateRange({
				selected: "custom",
				custom: {
					from: range.comparison.startDate,
					to: range.comparison.endDate,
				},
			});
		}
	};

	return (
		<Card className={cn("flex h-full flex-col gap-2")}>
			<CardHeader>
				<CardDescription className="text-base">Cumulative Net</CardDescription>
				<CardDescription>
					<div className="flex flex-col">
						<div className="flex items-baseline gap-2">
							<CurrencyValue
								value={displayBalance}
								currency={currency}
								className={cn("text-3xl font-medium")}
							/>
						</div>
						{isHovering && displayNet !== null ? (
							<div className="flex min-h-9 items-center gap-1">
								{displayNet > 0 ? (
									<TrendingUpIcon
										className={cn("size-4", trendChangeVariants({ trend: "increase" }))}
									/>
								) : displayNet < 0 ? (
									<TrendingDownIcon
										className={cn("size-4", trendChangeVariants({ trend: "decrease" }))}
									/>
								) : null}
								<CurrencyValue
									value={displayNet}
									currency={currency}
									className={cn(
										"text-sm font-medium",
										displayNet > 0
											? trendChangeVariants({ trend: "increase" })
											: displayNet < 0
												? trendChangeVariants({ trend: "decrease" })
												: trendChangeVariants({ trend: "no-change" }),
									)}
								/>
							</div>
						) : (
							<PercentageChangeDisplay
								change={netChange}
								comparisonText={comparisonText || undefined}
								onComparisonClick={handleComparisonClick}
							/>
						)}
					</div>
				</CardDescription>
			</CardHeader>
			<CardContent className="h-full flex-1">
				<ChartContainer
					config={chartConfig}
					className="[&_.recharts-curve.recharts-tooltip-cursor]:stroke-muted-foreground/50 aspect-auto h-full w-full **:focus:outline-none"
				>
					<AreaChart
						accessibilityLayer
						data={data}
						margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
					>
						<defs>
							<linearGradient id="gradient-cash-flow" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={trendColor} stopOpacity={0.4} />
								<stop offset="100%" stopColor={trendColor} stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid
							vertical={false}
							strokeDasharray="0 4"
							strokeLinecap="round"
							strokeWidth={2}
							opacity={0.9}
						/>
						<XAxis
							dataKey="date"
							axisLine={false}
							tickLine={false}
							tickMargin={8}
							tickFormatter={(value) => formatChartDate(value, range.bucket)}
							interval="preserveStartEnd"
							minTickGap={32}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tickFormatter={(value) => formatCompactNumber(value as number)}
							width={48}
						/>
						<ChartTooltip
							cursor={{
								strokeWidth: 1,
								strokeDasharray: "4 4",
							}}
							content={
								<TooltipContent bucket={range.bucket} setHoveredDataPoint={setHoveredDataPoint} />
							}
						/>
						<Area
							type="monotone"
							dataKey="balance"
							fill="url(#gradient-cash-flow)"
							fillOpacity={1}
							stroke={trendColor}
							strokeWidth={2}
							isAnimationActive={false}
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}

function TooltipContent({
	active,
	payload,
	coordinate,
	bucket,
	setHoveredDataPoint,
}: {
	active?: boolean;
	payload?: Array<{ payload: CashFlowPoint; value: number }>;
	coordinate?: { x: number; y: number };
	bucket: SeriesBucket;
	setHoveredDataPoint: (value: CashFlowPoint | null) => void;
}) {
	useEffect(() => {
		if (active && payload && payload.length) {
			setHoveredDataPoint(payload[0].payload as CashFlowPoint);
		} else {
			setHoveredDataPoint(null);
		}
	}, [active, payload, setHoveredDataPoint]);

	if (active && payload && payload.length && coordinate) {
		const dataPoint = payload[0].payload as CashFlowPoint;
		const date = datetime.parse(dataPoint.date, "yyyy-MM-dd", new Date());
		const formattedDate =
			bucket === "month" ? datetime.format(date, "MMMM yyyy") : datetime.format(date, "MMMM dd");

		const tooltipStyle: React.CSSProperties = {
			position: "absolute",
			left: coordinate.x,
			top: 0,
			transform: "translateX(-50%)",
			pointerEvents: "none",
			zIndex: 9999,
		};

		return (
			<div
				className="glass text-muted-foreground min-w-max p-2 text-xs tracking-wider"
				style={tooltipStyle}
			>
				{formattedDate}
			</div>
		);
	}
	return null;
}

function formatChartDate(dateValue: string, bucket: SeriesBucket): string {
	const date = datetime.parse(dateValue, "yyyy-MM-dd", new Date());
	return datetime.format(date, bucket === "month" ? "MMM yyyy" : "MMM dd");
}
