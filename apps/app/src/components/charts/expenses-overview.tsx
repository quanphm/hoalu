import {
	chartCategoryFilterAtom,
	chartGroupByAtom,
	customDateRangeAtom,
	selectDateRangeAtom,
	syncedDateRangeAtom,
} from "#app/atoms/filters.ts";
import { type SyncedExpense, useExpenseStats } from "#app/components/expenses/use-expenses.ts";
import { useIncomeStats } from "#app/components/incomes/use-incomes.ts";
import { formatCurrency } from "#app/helpers/currency.ts";
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
import { CheckIcon, Loader2Icon, ZapIcon } from "@hoalu/icons/lucide";
import { CameraIcon } from "@hoalu/icons/nucleo";
import { Button } from "@hoalu/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@hoalu/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@hoalu/ui/chart";
import { cn } from "@hoalu/ui/utils";
import { getRouteApi } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";

import { CurrencyValue } from "../currency-value.tsx";
import { PercentageChangeDisplay } from "../percentage-change.tsx";
import { ChartCategoryFilter, ChartGroupByFilter } from "./dashboard-date-filter.tsx";

import type { SyncedCategory } from "#app/components/categories/use-categories.ts";
import type { SyncedIncome } from "#app/components/incomes/use-incomes.ts";
import type { ColorSchema } from "@hoalu/common/schema";

function ClippedBarShape(props: Record<string, unknown>) {
	const x = (props.x as number) ?? 0;
	const y = (props.y as number) ?? 0;
	const width = (props.width as number) ?? 0;
	const height = (props.height as number) ?? 0;
	const fill = (props.fill as string) ?? "currentColor";
	const radiusProp = props.radius as number | number[] | undefined;
	const rx = Array.isArray(radiusProp) ? radiusProp[0] : (radiusProp ?? 2);

	if (width <= 0) return null;

	// Normal bar — render with rounded top corners
	if (y >= 0) return <rect x={x} y={y} width={width} height={height} fill={fill} rx={rx} />;

	// Outlier bar clipped at domain cap — hatch fill signals truncation
	const visibleHeight = y + height;
	if (visibleHeight <= 0) return null;

	const patternId = `clipped-hatch-${fill.replace(/[^a-z0-9]/gi, "_")}`;

	return (
		<>
			<defs>
				<pattern
					id={patternId}
					x="0"
					y="0"
					width="5"
					height="5"
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(-45)"
				>
					<rect width="10" height="10" fill={fill} opacity={0.35} />
					<rect width="2" height="10" fill={fill} />
				</pattern>
			</defs>
			<rect x={x} y={0} width={width} height={visibleHeight} fill={`url(#${patternId})`} />
		</>
	);
}

/**
 * Map category ColorSchema values to hex colors for Recharts fill.
 * Uses vibrant colors matching createChartColor() for visual consistency.
 * Dark mode uses lighter shades (400) for better visibility on dark backgrounds.
 */
const CATEGORY_COLOR_HEX: Record<ColorSchema, string> = {
	red: "#f87171", // red-400
	green: "#34d399", // emerald-400
	teal: "#2dd4bf", // teal-400
	blue: "#60a5fa", // blue-400
	yellow: "#fcd34d", // amber-300
	orange: "#fb923c", // orange-400
	purple: "#a78bfa", // violet-400
	pink: "#f472b6", // pink-400
	gray: "#64748b", // slate-500
	stone: "#78716c", // stone-500
};

const routeApi = getRouteApi("/_dashboard/$slug");

interface ExpenseOverviewProps {
	expenses: SyncedExpense[];
	incomes: SyncedIncome[];
	categories: SyncedCategory[];
}

type OverviewTab = "expenses" | "income";

type GroupedDateEntry = { date: string; value: number; isMonthly?: boolean };

export function ExpenseOverview(props: ExpenseOverviewProps) {
	const { slug } = routeApi.useParams();
	const navigate = routeApi.useNavigate();

	const [activeTab, setActiveTab] = useState<OverviewTab>("expenses");
	const isIncomeTab = activeTab === "income";
	const [clampOutliers, setClampOutliers] = useState(true);

	const expenseStats = useExpenseStats({
		expenses: props.expenses,
		categories: props.categories,
	});

	const incomeStats = useIncomeStats({
		incomes: props.incomes ?? [],
	});

	// Use the appropriate stats based on active tab
	const stats = isIncomeTab ? incomeStats : expenseStats;

	// For income tab: build byDate aggregation from income data
	const incomeByDate = useMemo(() => {
		if (!props.incomes) return [];
		const map = new Map<string, number>();
		for (const income of props.incomes) {
			const amount = income.convertedAmount > 0 ? income.convertedAmount : 0;
			map.set(income.date, (map.get(income.date) ?? 0) + amount);
		}
		return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
	}, [props.incomes]);

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

	const isCategoryMode = selectedCategoryIds.length > 0 && !isIncomeTab;

	// Source data for the chart — expenses use aggregation.byDate, income builds it inline
	const filteredData = isIncomeTab
		? filterDataByRange(incomeByDate, dateRange, customRange)
		: filterDataByRange(expenseStats.aggregation.byDate, dateRange, customRange);

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
		const rawByDateCat = expenseStats.aggregation.byDateAndCategory;

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
	}, [
		isCategoryMode,
		selectedCategoryIds,
		expenseStats.aggregation.byDateAndCategory,
		applyDateGrouping,
	]);

	const data = isCategoryMode ? categoryData : totalData;

	// Calculate median value for the reference line (excluding zero days)
	const medianValue = useMemo(() => {
		if (data.length === 0) return 0;

		let values: number[];

		if (isCategoryMode) {
			// For stacked bars, get total per day
			values = (data as Record<string, number | string | boolean | undefined>[]).map((item) => {
				return selectedCategoryIds.reduce((sum, catId) => {
					return sum + ((item[catId] as number) || 0);
				}, 0);
			});
		} else {
			// For total mode, get all values
			values = (data as { value: number }[]).map((item) => item.value);
		}

		// Filter out zero values (days with no spending)
		const nonZeroValues = values.filter((v) => v > 0);
		if (nonZeroValues.length === 0) return 0;

		// Sort and find median
		const sorted = nonZeroValues.sort((a, b) => a - b);
		const mid = Math.floor(sorted.length / 2);

		return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
	}, [data, isCategoryMode, selectedCategoryIds]);

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

	const maxBarSize = useMemo(() => {
		if (!isCategoryMode) return 32; // Larger bars for total mode

		const categoryCount = selectedCategoryIds.length;
		if (categoryCount === 1) return 32;
		if (categoryCount === 2) return 24;
		if (categoryCount === 3) return 18;
		return 14; // 4+ categories
	}, [isCategoryMode, selectedCategoryIds.length]);

	// IQR-based outlier cap: Tukey's fence (Q3 + 1.5×IQR) works on small datasets
	// unlike percentile approaches which collapse to the max value with <30 data points.
	const axisDomainCap = useMemo(() => {
		const values = isCategoryMode
			? (data as Record<string, number | string | boolean | undefined>[]).map((item) =>
					selectedCategoryIds.reduce((sum, catId) => sum + ((item[catId] as number) || 0), 0),
				)
			: (data as { value: number }[]).map((item) => item.value);
		const nonZero = values.filter((v) => v > 0);
		if (nonZero.length < 4) return null;
		const sorted = [...nonZero].sort((a, b) => a - b);
		const q1 = sorted[Math.floor(sorted.length * 0.25)];
		const q3 = sorted[Math.floor(sorted.length * 0.75)];
		const iqr = q3 - q1;
		if (iqr === 0) return null;
		const upperFence = q3 + 1.5 * iqr;
		const maxVal = sorted[sorted.length - 1];
		if (maxVal <= upperFence) return null;
		return Math.ceil(upperFence * 1.3);
	}, [data, isCategoryMode, selectedCategoryIds]);

	const activeDomainCap = clampOutliers ? axisDomainCap : null;

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
			to: "/$slug/transactions",
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

	const getCategoryColor = (catId: string) => {
		const info = expenseStats.categoryInfoMap[catId];
		if (!info) return CATEGORY_COLOR_HEX.gray;
		return CATEGORY_COLOR_HEX[info.color as ColorSchema] ?? CATEGORY_COLOR_HEX.gray;
	};

	const getCategoryName = (catId: string) => {
		return expenseStats.categoryInfoMap[catId]?.name ?? "Unknown";
	};

	const chartConfig = {
		date: {
			color: isIncomeTab ? "var(--success)" : "var(--destructive)",
		},
	} satisfies ChartConfig;

	return (
		<Card
			ref={chartRef}
			className={cn(
				"bg-background flex flex-col border-transparent",
				"border-r-border gap-2 rounded-none md:py-3",
			)}
		>
			<CardHeader>
				<CardDescription className="text-xs tracking-wider uppercase">
					{isIncomeTab ? "Incomes" : "Expenses"}
				</CardDescription>
				<CardDescription>
					<div className="flex flex-col">
						<div className="flex items-baseline gap-2">
							<CurrencyValue
								value={totalExpenses}
								currency={currency}
								className="text-3xl font-medium"
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
								size="sm"
								change={stats.amount.change}
								comparisonText={stats.comparisonText || undefined}
								onComparisonClick={handleComparisonClick}
								invertColor={!isIncomeTab}
							/>
						)}
					</div>
				</CardDescription>
				<CardAction>
					{dateRange === "custom" && (
						<div data-slot="chart-group-by">
							<ChartGroupByFilter />
						</div>
					)}
					{!isIncomeTab && (
						<div className="hide-in-screenshot">
							<ChartCategoryFilter categories={props.categories} />
						</div>
					)}
					<div className="hide-in-screenshot flex h-auto gap-0">
						<Button
							variant={isIncomeTab ? "outline" : "ghost"}
							size="sm"
							onClick={() => setActiveTab("income")}
						>
							Incomes
						</Button>
						<Button
							variant={!isIncomeTab ? "outline" : "ghost"}
							size="sm"
							onClick={() => setActiveTab("expenses")}
						>
							Expenses
						</Button>
					</div>
					{axisDomainCap && (
						<Button
							variant={clampOutliers ? "outline" : "ghost"}
							size="icon-sm"
							onClick={() => setClampOutliers((v) => !v)}
							className="hide-in-screenshot"
							title={
								clampOutliers
									? "Smart scale on — click to see full range"
									: "Full scale — click to restore smart scale"
							}
						>
							<ZapIcon />
						</Button>
					)}
					<Button
						variant="outline"
						size="icon-sm"
						onClick={handleScreenshot}
						disabled={status === "pending"}
						className="hide-in-screenshot"
						title={status === "success" ? "Copied to clipboard!" : "Take screenshot"}
					>
						{(status === "idle" || status === "error") && <CameraIcon />}
						{status === "pending" && <Loader2Icon className="animate-spin" />}{" "}
						{status === "success" && <CheckIcon className="text-green-600" />}{" "}
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className="flex-1 px-3 pt-0 pb-0">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full **:focus:outline-none [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-(--chart-1)/5"
				>
					<BarChart
						accessibilityLayer
						data={data}
						maxBarSize={maxBarSize}
						margin={{ left: -12, right: 12, top: 12 }}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
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
									: datetime.format(date, "MMM dd, yyyy");
							}}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => (value === 0 ? "0" : `${(value / 1000000).toFixed(1)}M`)}
							domain={activeDomainCap ? ([0, activeDomainCap] as [number, number]) : undefined}
							allowDataOverflow={!!activeDomainCap}
						/>
						{medianValue > 0 && (
							<ReferenceLine
								y={medianValue}
								stroke="var(--foreground)"
								strokeDasharray="0 4"
								strokeLinecap="round"
								strokeWidth={2}
								opacity={0.72}
								ifOverflow="extendDomain"
								label={(props: { viewBox?: { x: number; y: number; width: number } }) => {
									const { viewBox } = props;
									if (!viewBox) return null;
									const text = formatCurrency(medianValue, currency, {
										style: "currency",
										currencyDisplay: "narrowSymbol",
									});
									const px = 5;
									const textWidth = text.length * 6.5;
									const rectW = textWidth + px * 2;
									const rectH = 16;
									const x = viewBox.x + viewBox.width - rectW - 4;
									const y = viewBox.y - rectH - 4;

									return (
										<g>
											<rect
												x={x}
												y={y}
												width={rectW}
												height={rectH}
												rx={3}
												fill="var(--background)"
												stroke="var(--border)"
												strokeWidth={0.5}
											/>
											<text
												x={x + px + 1}
												y={y + rectH / 2 + 1}
												dominantBaseline="middle"
												fill="var(--foreground)"
												fontSize={10}
												fontWeight="bold"
											>
												{text}
											</text>
										</g>
									);
								}}
							/>
						)}
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
															key={entry.dataKey as any}
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
																value={entry.value as any}
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
																	className="text-sm font-medium"
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
														value={payload[0].value as any}
														currency={currency}
														className="font-medium"
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
							selectedCategoryIds.map((catId, catIdx) => {
								return (
									<Bar
										key={catId}
										dataKey={catId}
										fill={getCategoryColor(catId)}
										className="cursor-pointer"
										onClick={handleBarClick}
										isAnimationActive={true}
										radius={
											selectedCategoryIds.length >= 2
												? catIdx === 0
													? [0, 0, 2, 2]
													: catIdx === selectedCategoryIds.length - 1
														? [2, 2, 0, 0]
														: [0, 0, 0, 0]
												: [2, 2, 0, 0]
										}
										stackId={selectedCategoryIds.length >= 2 ? "categories" : undefined}
										shape={activeDomainCap ? (ClippedBarShape as any) : undefined}
									/>
								);
							})
						) : (
							<Bar
								dataKey="value"
								fill={chartConfig.date.color}
								className="cursor-pointer"
								onClick={handleBarClick}
								isAnimationActive={true}
								radius={[2, 2, 0, 0]}
								shape={activeDomainCap ? (ClippedBarShape as any) : undefined}
							/>
						)}
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
