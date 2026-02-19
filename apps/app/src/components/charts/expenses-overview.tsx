import {
	chartCategoryFilterAtom,
	chartGroupByAtom,
	customDateRangeAtom,
	selectDateRangeAtom,
	syncedDateRangeAtom,
} from "#app/atoms/filters.ts";
import type { SyncedCategory } from "#app/components/categories/use-categories.ts";
import { type SyncedExpense, useExpenseStats } from "#app/components/expenses/use-expenses.ts";
import {
	calculateComparisonDateRange,
	filterDataByRange,
	generateDailyDataForRange,
	generateDailyDataWithZeros,
	generateMTDDataWithZeros,
	getStartOfWeek,
	groupDataByMonth,
	isMonthBasedRange,
} from "#app/helpers/date-range.ts";
import { useScreenshot } from "#app/hooks/use-screenshot.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { datetime } from "@hoalu/common/datetime";
import type { ColorSchema } from "@hoalu/common/schema";
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
import { getRouteApi } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useRef } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { CurrencyValue } from "../currency-value.tsx";
import { PercentageChangeDisplay } from "../percentage-change.tsx";

const chartConfig = {
	value: {
		label: "Total expense",
	},
	date: {
		label: "Expense",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

/**
 * Map category ColorSchema values to hex colors for Recharts fill.
 * Uses darker shades for better visibility on charts.
 */
const CATEGORY_COLOR_HEX: Record<ColorSchema, string> = {
	red: "#ef4444",
	green: "#22c55e",
	teal: "#14b8a6",
	blue: "#6366f1",
	yellow: "#eab308",
	orange: "#f97316",
	purple: "#a855f7",
	pink: "#ec4899",
	gray: "#6b7280",
	stone: "#78716c",
};

const routeApi = getRouteApi("/_dashboard/$slug");

interface ExpenseOverviewProps {
	expenses: SyncedExpense[];
	categories: SyncedCategory[];
}

type GroupedDateEntry = { date: string; value: number; isMonthly?: boolean };

export function ExpenseOverview(props: ExpenseOverviewProps) {
	const { slug } = routeApi.useParams();
	const navigate = routeApi.useNavigate();

	const stats = useExpenseStats({
		expenses: props.expenses,
		categories: props.categories,
	});

	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);
	const setSyncedDateRange = useSetAtom(syncedDateRangeAtom);
	const selectedCategoryIds = useAtomValue(chartCategoryFilterAtom);
	const chartGroupBy = useAtomValue(chartGroupByAtom);
	const {
		metadata: { currency },
	} = useWorkspace();
	const chartRef = useRef<HTMLDivElement>(null);
	const { takeScreenshot, status } = useScreenshot();

	const isCategoryMode = selectedCategoryIds.length > 0;

	const filteredData = filterDataByRange(stats.aggregation.byDate, dateRange, customRange);

	// Apply date grouping logic (shared between total and category mode)
	const applyDateGrouping = useCallback(
		(sourceData: { date: string; value: number }[]): GroupedDateEntry[] => {
			const today = new Date();

			if (dateRange === "ytd") {
				return groupDataByMonth(sourceData, true);
			} else if (dateRange === "all") {
				return groupDataByMonth(sourceData, false);
			} else if (isMonthBasedRange(dateRange)) {
				return groupDataByMonth(sourceData, false);
			} else if (dateRange === "mtd") {
				return generateMTDDataWithZeros(sourceData);
			} else if (dateRange === "wtd") {
				const startOfWeek = getStartOfWeek(today, 1);
				const endOfWeek = datetime.endOfDay(today);
				return generateDailyDataForRange(sourceData, startOfWeek, endOfWeek);
			} else if (dateRange === "custom" && customRange) {
				const startDate = datetime.startOfDay(customRange.from);
				const endDate = datetime.endOfDay(customRange.to);
				if (chartGroupBy === "month") {
					return groupDataByMonth(sourceData, false);
				} else {
					return generateDailyDataForRange(sourceData, startDate, endDate);
				}
			} else if (dateRange === "7" || dateRange === "30" || dateRange === "90") {
				const days = parseInt(dateRange, 10);
				return generateDailyDataWithZeros(sourceData, days);
			} else {
				return generateDailyDataWithZeros(sourceData, 50);
			}
		},
		[dateRange, customRange, chartGroupBy],
	);

	const totalData = useMemo(
		() => applyDateGrouping(filteredData),
		[applyDateGrouping, filteredData],
	);

	// Category mode data: build per-category series then merge into grouped records
	const categoryData = useMemo(() => {
		if (!isCategoryMode) return [];

		// Filter byDateAndCategory to only selected categories
		const rawByDateCat = stats.aggregation.byDateAndCategory;

		// First, build per-category { date, value }[] arrays
		const perCategoryDateValues: Record<string, { date: string; value: number }[]> = {};
		for (const catId of selectedCategoryIds) {
			const dateValueMap = new Map<string, number>();
			for (const entry of rawByDateCat) {
				const date = entry.date as string;
				const amount = (entry[catId] as number) ?? 0;
				if (amount > 0) {
					dateValueMap.set(date, (dateValueMap.get(date) || 0) + amount);
				}
			}
			perCategoryDateValues[catId] = Array.from(dateValueMap.entries()).map(([date, value]) => ({
				date,
				value,
			}));
		}

		// Apply date grouping to each category separately
		const groupedPerCategory: Record<string, GroupedDateEntry[]> = {};
		for (const catId of selectedCategoryIds) {
			groupedPerCategory[catId] = applyDateGrouping(perCategoryDateValues[catId] || []);
		}

		// Merge into a single array of records: { date, [catId]: value, ... }
		// Use the first category's dates as the date skeleton (they all share the same grouping)
		const firstCatId = selectedCategoryIds[0];
		const dateSkeleton = groupedPerCategory[firstCatId] || [];

		return dateSkeleton.map((item, index) => {
			const merged: Record<string, number | string | boolean | undefined> = {
				date: item.date,
				isMonthly: item.isMonthly,
			};
			for (const catId of selectedCategoryIds) {
				const catData = groupedPerCategory[catId];
				merged[catId] = catData?.[index]?.value ?? 0;
			}
			return merged;
		});
	}, [isCategoryMode, selectedCategoryIds, stats.aggregation.byDateAndCategory, applyDateGrouping]);

	const data = isCategoryMode ? categoryData : totalData;

	// Calculate total: filtered by selected categories in category mode, or all expenses in total mode
	const totalExpenses = useMemo(() => {
		if (!isCategoryMode) {
			// Total mode: sum all filtered expenses
			return filteredData.reduce((sum, item) => sum + item.value, 0);
		}

		// Category mode: sum only selected categories from the chart data
		return (data as Record<string, number | string | boolean | undefined>[]).reduce((sum, item) => {
			return (
				sum +
				selectedCategoryIds.reduce((catSum, catId) => {
					return catSum + ((item[catId] as number) || 0);
				}, 0)
			);
		}, 0);
	}, [isCategoryMode, filteredData, data, selectedCategoryIds]);

	// Dynamic bar size based on number of categories
	const maxBarSize = useMemo(() => {
		if (!isCategoryMode) return 32; // Larger bars for total mode

		const categoryCount = selectedCategoryIds.length;
		if (categoryCount === 1) return 32;
		if (categoryCount === 2) return 24;
		if (categoryCount === 3) return 18;
		return 14; // 4+ categories
	}, [isCategoryMode, selectedCategoryIds.length]);

	const handleBarClick = (barData: {
		payload?: { date: string; value: number; isMonthly?: boolean };
	}) => {
		if (!barData.payload?.date) {
			return;
		}

		const clickedDate = datetime.parse(barData.payload.date, "yyyy-MM-dd", new Date());
		let startDate: Date;
		let endDate: Date;

		if (barData.payload.isMonthly) {
			startDate = datetime.startOfDay(
				new Date(clickedDate.getFullYear(), clickedDate.getMonth(), 1),
			);
			endDate = datetime.endOfDay(
				new Date(clickedDate.getFullYear(), clickedDate.getMonth() + 1, 0),
			);
		} else {
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

	const getCategoryColor = (catId: string): string => {
		const info = stats.categoryInfoMap[catId];
		if (!info) return CATEGORY_COLOR_HEX.gray;
		return CATEGORY_COLOR_HEX[info.color as ColorSchema] ?? CATEGORY_COLOR_HEX.gray;
	};

	const getCategoryName = (catId: string): string => {
		return stats.categoryInfoMap[catId]?.name ?? "Unknown";
	};

	return (
		<Card ref={chartRef} className="flex flex-col">
			<CardHeader>
				<CardTitle>Expenses</CardTitle>
				<CardDescription>
					<div className="flex flex-col gap-1">
						<div className="flex items-baseline gap-2">
							<CurrencyValue
								value={totalExpenses}
								currency={currency}
								className="text-3xl font-semibold"
							/>
							{isCategoryMode && (
								<span className="text-muted-foreground text-sm">
									({selectedCategoryIds.length}{" "}
									{selectedCategoryIds.length === 1 ? "category" : "categories"})
								</span>
							)}
						</div>
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
						variant="outline"
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
			<CardContent className="flex-1 px-2 sm:p-6">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-(--chart-1)/15"
				>
					<BarChart
						accessibilityLayer
						data={data}
						maxBarSize={maxBarSize}
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
										? [(data[0] as { date: string }).date]
										: [
												(data[0] as { date: string }).date,
												(data[data.length - 1] as { date: string }).date,
											]
							}
							tickFormatter={(value) => {
								const date = datetime.parse(value, "yyyy-MM-dd", new Date());
								return dateRange === "ytd" ||
									dateRange === "all" ||
									isMonthBasedRange(dateRange) ||
									(dateRange === "custom" && chartGroupBy === "month")
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
										dateRange === "ytd" || dateRange === "all" || isMonthBasedRange(dateRange)
											? datetime.format(date, "MMMM yyyy")
											: datetime.format(date, "dd/MM/yyyy");

									if (isCategoryMode) {
										// Calculate total for stacked bars (2+ categories)
										const total = payload.reduce(
											(sum, entry) => sum + (Number(entry.value) || 0),
											0,
										);
										const showTotal = selectedCategoryIds.length >= 2;

										return (
											<div className="bg-background rounded-md border p-3 shadow-sm">
												<div className="grid gap-2">
													<span className="text-muted-foreground text-xs tracking-wider uppercase">
														{formattedDate}
													</span>
													{payload.map((entry) => (
														<div
															key={entry.dataKey}
															className="flex items-center justify-between gap-4"
														>
															<div className="flex items-center gap-1.5">
																<div
																	className="size-2.5 rounded-full"
																	style={{ backgroundColor: entry.color }}
																/>
																<span className="text-sm">
																	{getCategoryName(entry.dataKey as string)}
																</span>
															</div>
															<CurrencyValue
																value={entry.value}
																currency={currency}
																className="text-sm font-medium"
															/>
														</div>
													))}
													{showTotal && (
														<div className="border-t pt-2">
															<div className="flex items-center justify-between gap-4">
																<span className="text-sm font-semibold">Total</span>
																<CurrencyValue
																	value={total}
																	currency={currency}
																	className="text-sm font-bold"
																/>
															</div>
														</div>
													)}
												</div>
											</div>
										);
									}

									return (
										<div className="bg-background rounded-md border p-3 shadow-sm">
											<div className="grid gap-2">
												<div className="flex flex-col">
													<span className="text-muted-foreground text-xs tracking-wider uppercase">
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
						{isCategoryMode ? (
							selectedCategoryIds.map((catId) => (
								<Bar
									key={catId}
									dataKey={catId}
									fill={getCategoryColor(catId)}
									className="cursor-pointer"
									onClick={handleBarClick}
									isAnimationActive={false}
									stackId={selectedCategoryIds.length >= 2 ? "categories" : undefined}
								/>
							))
						) : (
							<Bar
								dataKey="value"
								fill="var(--color-date)"
								className="cursor-pointer"
								onClick={handleBarClick}
								isAnimationActive={false}
							/>
						)}
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
