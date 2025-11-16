import { getRouteApi } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useRef } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { datetime } from "@hoalu/common/datetime";
import { CheckIcon, Loader2Icon } from "@hoalu/icons/lucide";
import { CameraIcon } from "@hoalu/icons/nucleo";
import { Button } from "@hoalu/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@hoalu/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@hoalu/ui/chart";

import {
	customDateRangeAtom,
	selectDateRangeAtom,
	syncedDateRangeAtom,
} from "#app/atoms/filters.ts";
import { useExpenseStats } from "#app/components/expenses/use-expenses.ts";
import {
	calculateComparisonDateRange,
	filterDataByRange,
	generateDailyDataForRange,
	generateDailyDataWithZeros,
	generateMTDDataWithZeros,
	getStartOfWeek,
	groupDataByMonth,
} from "#app/helpers/date-range.ts";
import { useScreenshot } from "#app/hooks/use-screenshot.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { CurrencyValue } from "../currency-value";
import { PercentageChangeDisplay } from "../percentage-change";

const chartConfig = {
	value: {
		label: "Total expense",
	},
	date: {
		label: "Expense",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

const routeApi = getRouteApi("/_dashboard/$slug");

export function ExpenseOverview() {
	const { slug } = routeApi.useParams();
	const navigate = routeApi.useNavigate();

	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);
	const setSyncedDateRange = useSetAtom(syncedDateRangeAtom);
	const stats = useExpenseStats();
	const {
		metadata: { currency },
	} = useWorkspace();
	const chartRef = useRef<HTMLDivElement>(null);
	const { takeScreenshot, status } = useScreenshot();

	const filteredData = filterDataByRange(stats.aggregation.byDate, dateRange, customRange);

	// Group by month for year-to-date and all-time views
	const data = (() => {
		const today = new Date();

		if (dateRange === "ytd") {
			return groupDataByMonth(filteredData, true);
		} else if (dateRange === "all") {
			return groupDataByMonth(filteredData, false);
		} else if (dateRange === "mtd") {
			// For month-to-date, generate daily data with zeros for current month
			return generateMTDDataWithZeros(filteredData);
		} else if (dateRange === "wtd") {
			// For week-to-date, compute start of week (Monday) and generate daily data
			const startOfWeek = getStartOfWeek(today, 1);
			const endOfWeek = datetime.endOfDay(today);
			return generateDailyDataForRange(filteredData, startOfWeek, endOfWeek);
		} else if (dateRange === "custom" && customRange) {
			// For custom ranges, generate daily data for the specified range
			const startDate = datetime.startOfDay(customRange.from);
			const endDate = datetime.endOfDay(customRange.to);
			return generateDailyDataForRange(filteredData, startDate, endDate);
		} else if (dateRange === "7" || dateRange === "30" || dateRange === "90") {
			// For numeric day ranges, generate data with zeros for last N days
			const days = parseInt(dateRange, 10);
			return generateDailyDataWithZeros(filteredData, days);
		} else {
			// Fallback for any other ranges
			return generateDailyDataWithZeros(filteredData, 50);
		}
	})();

	const totalExpenses = filteredData.reduce((sum, item) => sum + item.value, 0);

	const handleBarClick = (data: {
		payload?: { date: string; value: number; isMonthly?: boolean };
	}) => {
		if (!data.payload?.date) {
			return;
		}

		const clickedDate = datetime.parse(data.payload.date, "yyyy-MM-dd", new Date());
		let startDate: Date;
		let endDate: Date;

		if (data.payload.isMonthly) {
			// For monthly data, set range to the entire month
			startDate = datetime.startOfDay(
				new Date(clickedDate.getFullYear(), clickedDate.getMonth(), 1),
			);
			endDate = datetime.endOfDay(
				new Date(clickedDate.getFullYear(), clickedDate.getMonth() + 1, 0),
			);
		} else {
			// For daily data, set range to the specific day
			startDate = datetime.startOfDay(clickedDate);
			endDate = datetime.endOfDay(clickedDate);
		}

		const searchQuery = `${startDate.getTime()}-${endDate.getTime()}`;
		navigate({
			to: "/$slug/expenses",
			params: { slug },
			search: { date: searchQuery },
		});
	};

	const handleComparisonClick = () => {
		const comparisonRange = calculateComparisonDateRange(dateRange, customRange);
		if (comparisonRange) {
			setSyncedDateRange({
				selected: "custom",
				custom: {
					from: comparisonRange.startDate,
					to: comparisonRange.endDate,
				},
			});
		}
	};

	const handleScreenshot = () => {
		if (!chartRef.current) return;
		if (!("clipboard" in navigator) || typeof ClipboardItem === "undefined") return;
		navigator.clipboard.write([
			new ClipboardItem({
				"image/png": new Promise((resolve, reject) => {
					takeScreenshot(chartRef.current).then(resolve).catch(reject);
				}),
			}),
		]);
	};

	return (
		<Card ref={chartRef}>
			<CardHeader>
				<CardTitle>Expenses</CardTitle>
				<CardDescription>
					<div className="flex flex-col gap-1">
						<CurrencyValue
							value={totalExpenses}
							currency={currency}
							className="font-semibold text-3xl"
						/>
						{stats.hasComparison && (
							<PercentageChangeDisplay
								change={stats.amount.change}
								comparisonText={stats.comparisonText || undefined}
								onComparisonClick={handleComparisonClick}
							/>
						)}
					</div>
				</CardDescription>
				<CardAction>
					<Button
						variant="secondary"
						size="icon"
						onClick={handleScreenshot}
						disabled={status === "pending"}
						className="hide-in-screenshot size-8"
						title={status === "success" ? "Copied to clipboard!" : "Take screenshot"}
					>
						{(status === "idle" || status === "error") && <CameraIcon className="size-4" />}
						{status === "pending" && <Loader2Icon className="size-4 animate-spin" />}{" "}
						{status === "success" && <CheckIcon className="size-4 text-green-600" />}{" "}
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className="px-2 sm:p-6">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-(--chart-1)/15"
				>
					<BarChart
						accessibilityLayer
						data={data}
						maxBarSize={20}
						margin={{ left: -12, right: 12, top: 12 }}
					>
						<CartesianGrid vertical={false} strokeDasharray="2 2" stroke="var(--border)" />
						<XAxis
							dataKey="date"
							tickLine={false}
							tickMargin={12}
							ticks={
								data.length === 0
									? []
									: data.length === 1
										? [data[0].date]
										: [data[0].date, data[data.length - 1].date]
							}
							tickFormatter={(value) => {
								const date = datetime.parse(value, "yyyy-MM-dd", new Date());
								return dateRange === "ytd" || dateRange === "all"
									? datetime.format(date, "MMM yyyy")
									: datetime.format(date, "dd/MM/yyyy");
							}}
							stroke="var(--border)"
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => (value === 0 ? "0" : `${(value / 1000000).toFixed(1)}M`)}
						/>
						<ChartTooltip
							content={({ active, payload, label }) => {
								if (active && payload && payload.length && label) {
									const date = datetime.parse(label as string, "yyyy-MM-dd", new Date());
									const formattedDate =
										dateRange === "ytd" || dateRange === "all"
											? datetime.format(date, "MMMM yyyy")
											: datetime.format(date, "dd/MM/yyyy");

									return (
										<div className="rounded-md border bg-background p-3 shadow-sm">
											<div className="grid gap-2">
												<div className="flex flex-col">
													<span className="text-muted-foreground text-xs uppercase tracking-wider">
														{formattedDate}
													</span>
													<CurrencyValue
														value={payload[0].value}
														currency={currency}
														className="font-bold"
													/>
												</div>
											</div>
										</div>
									);
								}
								return null;
							}}
						/>
						<Bar
							dataKey="value"
							fill="var(--color-date)"
							className="cursor-pointer"
							onClick={handleBarClick}
							isAnimationActive={false}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
