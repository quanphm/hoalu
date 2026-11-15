import { TrendDownIcon, TrendUpIcon } from "@hoalu/icons/phosphor";
import { Card } from "@hoalu/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@hoalu/ui/chart";
import { cn } from "@hoalu/ui/utils";
import { useId, type ReactNode } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ReferenceLine,
	XAxis,
	YAxis,
} from "recharts";

import { CurrencyValue } from "#app/components/currency-value.tsx";
import { PercentageChangeDisplay } from "#app/components/percentage-change.tsx";
import { formatAxisDate } from "#app/helpers/format-date.ts";
import { formatNumber, niceMoneyAxis } from "#app/helpers/number.ts";
import { trendChangeVariants } from "#app/helpers/percentage-change.ts";

import { useTooltipDismiss } from "./use-tooltip-dismiss.ts";

import type {
	CashFlowPoint,
	DashboardModel,
	SeriesBucket,
	SeriesPoint,
} from "#app/services/dashboard-model.ts";

const chartConfig = {} satisfies ChartConfig;

const PLOT_HEIGHT = "h-[86px]";

export function CashFlowTiles(props: { model: DashboardModel }) {
	const { model } = props;
	const { currency, range, cashFlow, incomes, expenses } = model;
	const { stats } = cashFlow;

	const netSeries = cashFlow.series;
	const finalBalance = netSeries.length > 0 ? netSeries[netSeries.length - 1].balance : 0;
	const netColor = finalBalance >= 0 ? "var(--success)" : "var(--destructive)";

	const transactionDiff = stats.transactions.diff;

	return (
		<div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
			<StatTile
				label="Net"
				figure={
					<CurrencyValue
						value={stats.net.total}
						currency={currency}
						className="text-lg sm:text-xl xl:text-2xl"
					/>
				}
				delta={<PercentageChangeDisplay change={stats.net.change} size="sm" />}
			>
				<TrendChart
					kind="area"
					points={netSeries.map((point) => ({ ...point, value: point.balance }))}
					color={netColor}
					fillOpacity={0.1}
					fillToFloor
					tickCount={3}
					bucket={range.bucket}
					renderTooltip={(point: CashFlowPoint) => (
						<NetTooltipPoint point={point} currency={currency} />
					)}
				/>
			</StatTile>

			<StatTile
				label="Incomes"
				figure={
					<CurrencyValue
						value={stats.income.total}
						currency={currency}
						className="text-lg sm:text-xl xl:text-2xl"
					/>
				}
				delta={<PercentageChangeDisplay change={stats.income.change} size="sm" />}
			>
				<TrendChart
					kind="area"
					points={incomes.series}
					color="var(--success)"
					fillOpacity={0.18}
					tickCount={3}
					bucket={range.bucket}
					renderTooltip={(point: SeriesPoint) => (
						<CurrencyValue
							value={point.value}
							currency={currency}
							className="text-xs font-medium"
						/>
					)}
				/>
			</StatTile>

			<StatTile
				label="Expenses"
				figure={
					<CurrencyValue
						value={stats.expenses.total}
						currency={currency}
						className="text-lg sm:text-xl xl:text-2xl"
					/>
				}
				delta={<PercentageChangeDisplay change={stats.expenses.change} size="sm" invertColor />}
			>
				<TrendChart
					kind="area"
					points={expenses.series}
					color="var(--destructive)"
					fillOpacity={0.18}
					tickCount={3}
					bucket={range.bucket}
					renderTooltip={(point: SeriesPoint) => (
						<CurrencyValue
							value={point.value}
							currency={currency}
							className="text-xs font-medium"
						/>
					)}
				/>
			</StatTile>

			<StatTile
				label="Transactions"
				figure={
					<span className="text-lg leading-6 font-medium tabular-nums sm:text-xl xl:text-2xl">
						{formatNumber(stats.transactions.count)}
					</span>
				}
				delta={
					transactionDiff !== 0 ? (
						<span
							className={cn(
								"inline-flex items-center gap-1 text-xs font-medium tabular-nums",
								trendChangeVariants({
									trend: transactionDiff > 0 ? "increase" : "decrease",
								}),
							)}
						>
							{transactionDiff > 0 ? (
								<TrendUpIcon className="size-3" />
							) : (
								<TrendDownIcon className="size-3" />
							)}
							{transactionDiff > 0 ? "+" : ""}
							{transactionDiff}
						</span>
					) : null
				}
			>
				<TrendChart
					kind="bar"
					points={cashFlow.series.map((point) => ({ ...point, value: point.count }))}
					color="color-mix(in oklab, var(--muted-foreground) 78%, transparent)"
					tickCount={2}
					bucket={range.bucket}
					renderTooltip={(point: CashFlowPoint) => (
						<span className="text-xs font-medium tabular-nums">
							{formatNumber(point.count)} {point.count === 1 ? "transaction" : "transactions"}
						</span>
					)}
				/>
			</StatTile>
		</div>
	);
}

interface StatTileProps {
	label: string;
	figure: ReactNode;
	delta: ReactNode;
	children: ReactNode;
}

function StatTile(props: StatTileProps) {
	return (
		<Card className="gap-2 px-4 py-3.5">
			<span className="text-muted-foreground text-sm">{props.label}</span>
			<div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
				{props.figure}
				{props.delta}
			</div>
			<div className="mt-auto pt-2">{props.children}</div>
		</Card>
	);
}

interface TrendPoint {
	date: string;
	value: number;
}

interface TrendChartProps<T extends TrendPoint> {
	points: T[];
	kind: "area" | "bar";
	color: string;
	fillOpacity?: number;
	/** A cumulative series fills down to the axis floor instead of back to zero. */
	fillToFloor?: boolean;
	tickCount: number;
	bucket: SeriesBucket;
	renderTooltip: (point: T) => ReactNode;
}

function TrendChart<T extends TrendPoint>(props: TrendChartProps<T>) {
	const { points, kind, color, fillOpacity = 0.18, bucket } = props;
	const gradientId = useId().replace(/:/g, "");
	const { containerRef, active } = useTooltipDismiss<HTMLDivElement>();

	const hasData = points.some((point) => point.value !== 0);
	const axis = moneyAxis(
		points.map((point) => point.value),
		props.tickCount,
	);
	const firstDate = points[0]?.date;
	const lastDate = points[points.length - 1]?.date;
	const markerColor = `color-mix(in oklab, ${color} 55%, transparent)`;

	return (
		<div ref={containerRef} className="relative">
			<ChartContainer
				config={chartConfig}
				className={cn(
					"aspect-auto w-full **:focus:outline-none",
					PLOT_HEIGHT,
					kind === "bar" &&
						"[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-(--muted-foreground)/8",
				)}
			>
				{kind === "bar" ? (
					<BarChart
						accessibilityLayer
						data={points}
						margin={{ top: 4, right: 2, bottom: 2, left: 2 }}
					>
						<CartesianGrid vertical={false} stroke="var(--border)" strokeWidth={1} />
						<XAxis dataKey="date" hide />
						<YAxis hide domain={axis.domain} ticks={axis.ticks} allowDataOverflow />
						{hasData && (
							<SeriesMarkers firstDate={firstDate} lastDate={lastDate} color={markerColor} />
						)}
						<ChartTooltip
							active={active}
							cursor={{ fillOpacity: 0.08 }}
							content={<TileTooltip bucket={bucket} render={props.renderTooltip} />}
						/>
						{hasData && (
							<Bar
								dataKey="value"
								fill={color}
								radius={2}
								maxBarSize={12}
								isAnimationActive={false}
							/>
						)}
					</BarChart>
				) : (
					<AreaChart
						accessibilityLayer
						data={points}
						margin={{ top: 4, right: 2, bottom: 2, left: 2 }}
					>
						<defs>
							<linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
								<stop offset="100%" stopColor={color} stopOpacity={0.01} />
							</linearGradient>
						</defs>
						<CartesianGrid vertical={false} stroke="var(--border)" strokeWidth={1} />
						<XAxis dataKey="date" hide />
						<YAxis hide domain={axis.domain} ticks={axis.ticks} allowDataOverflow />
						{hasData && (
							<SeriesMarkers firstDate={firstDate} lastDate={lastDate} color={markerColor} />
						)}
						<ChartTooltip
							active={active}
							cursor={{ strokeWidth: 1, strokeDasharray: "4 4" }}
							content={<TileTooltip bucket={bucket} render={props.renderTooltip} />}
						/>
						{hasData && (
							<Area
								type="monotone"
								dataKey="value"
								stroke={color}
								strokeWidth={2}
								fill={`url(#${gradientId})`}
								fillOpacity={1}
								baseValue={props.fillToFloor ? axis.domain[0] : undefined}
								isAnimationActive={false}
								activeDot={{ r: 3, strokeWidth: 0 }}
							/>
						)}
					</AreaChart>
				)}
			</ChartContainer>
			{!hasData && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<span className="border-border bg-muted text-muted-foreground rounded-sm border px-2 py-0.5 text-xs">
						No data
					</span>
				</div>
			)}
		</div>
	);
}

/** Dashed brackets at both ends of the window, the way a range chart marks its bounds. */
function SeriesMarkers(props: { firstDate?: string; lastDate?: string; color: string }) {
	return (
		<>
			{props.firstDate && (
				<ReferenceLine
					x={props.firstDate}
					stroke={props.color}
					strokeWidth={1}
					strokeDasharray="3 3"
				/>
			)}
			{props.lastDate && (
				<ReferenceLine
					x={props.lastDate}
					stroke={props.color}
					strokeWidth={1}
					strokeDasharray="3 3"
				/>
			)}
		</>
	);
}

function TileTooltip<T extends TrendPoint>(props: {
	active?: boolean;
	payload?: Array<{ payload: T }>;
	bucket: SeriesBucket;
	render: (point: T) => ReactNode;
}) {
	if (!props.active || !props.payload?.length) return null;
	const point = props.payload[0]?.payload;
	if (!point) return null;

	return (
		<div className="bg-popover text-popover-foreground border-border/60 rounded-md border px-2 py-1 text-xs shadow-lg">
			<div className="text-muted-foreground">{formatAxisDate(point.date, props.bucket)}</div>
			<div className="flex items-baseline gap-2 tabular-nums">{props.render(point)}</div>
		</div>
	);
}

function NetTooltipPoint(props: { point: CashFlowPoint; currency: string }) {
	return (
		<>
			<CurrencyValue
				value={props.point.balance}
				currency={props.currency}
				className="text-xs font-medium"
			/>
			<span className="text-muted-foreground flex items-baseline gap-1 text-xs">
				{props.point.net > 0 ? "+" : ""}
				<CurrencyValue
					value={props.point.net}
					currency={props.currency}
					className="text-muted-foreground text-xs"
				/>
			</span>
		</>
	);
}

function moneyAxis(values: number[], tickCount: number) {
	const { domain, ticks } = niceMoneyAxis(values, tickCount);
	if (domain[1] === domain[0]) {
		return { domain: [domain[0], domain[0] + 1] as [number, number], ticks: [domain[0]] };
	}
	return { domain, ticks };
}
