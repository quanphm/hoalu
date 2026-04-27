import {
	customDateRangeAtom,
	PredefinedDateRange,
	selectDateRangeAtom,
} from "#app/atoms/filters.ts";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import {
	filterDataByRange,
	generateDailyDataForRange,
	generateDailyDataWithZeros,
	generateMTDDataWithZeros,
	getStartOfWeek,
	groupDataByMonth,
	isMonthBasedRange,
} from "#app/helpers/date-range.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { datetime } from "@hoalu/common/datetime";
import { Card, CardContent, CardDescription, CardHeader } from "@hoalu/ui/card";
import { type ChartConfig, ChartContainer } from "@hoalu/ui/chart";
import { cn } from "@hoalu/ui/utils";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ReferenceLine, Tooltip } from "recharts";

import type { SyncedExpense } from "#app/components/expenses/use-expenses.ts";
import type { SyncedIncome } from "#app/components/incomes/use-incomes.ts";

const chartConfig = {
	balance: {
		label: "Cash Flow",
		color: "var(--primary)",
	},
} satisfies ChartConfig;

interface CashFlowChartProps {
	incomes: SyncedIncome[];
	expenses: SyncedExpense[];
}

interface CashFlowDataPoint {
	date: string;
	net: number;
	balance: number;
	isMonthly?: boolean;
}

export function CashFlowChart(props: CashFlowChartProps) {
	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);
	const {
		metadata: { currency },
	} = useWorkspace();

	// Build daily income map
	const incomeByDate = useMemo(() => {
		const map = new Map<string, number>();
		for (const income of props.incomes) {
			const amount = income.convertedAmount > 0 ? income.convertedAmount : 0;
			map.set(income.date, (map.get(income.date) ?? 0) + amount);
		}
		return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
	}, [props.incomes]);

	// Build daily expense map
	const expenseByDate = useMemo(() => {
		const map = new Map<string, number>();
		for (const expense of props.expenses) {
			const amount = expense.convertedAmount > 0 ? expense.convertedAmount : 0;
			map.set(expense.date, (map.get(expense.date) ?? 0) + amount);
		}
		return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
	}, [props.expenses]);

	// Filter by date range
	const filteredIncomes = useMemo(
		() => filterDataByRange(incomeByDate, dateRange, customRange),
		[incomeByDate, dateRange, customRange],
	);
	const filteredExpenses = useMemo(
		() => filterDataByRange(expenseByDate, dateRange, customRange),
		[expenseByDate, dateRange, customRange],
	);

	// Apply same date grouping as expense chart, then calculate cumulative balance
	const applyDateGrouping = (
		incomeData: { date: string; value: number }[],
		expenseData: { date: string; value: number }[],
	): CashFlowDataPoint[] => {
		const today = new Date();

		let incomeGrouped: { date: string; value: number; isMonthly?: boolean }[];
		let expenseGrouped: { date: string; value: number; isMonthly?: boolean }[];

		if (dateRange === "ytd") {
			incomeGrouped = groupDataByMonth(incomeData, true);
			expenseGrouped = groupDataByMonth(expenseData, true);
		} else if (dateRange === "all") {
			incomeGrouped = groupDataByMonth(incomeData, false);
			expenseGrouped = groupDataByMonth(expenseData, false);
		} else if (isMonthBasedRange(dateRange)) {
			incomeGrouped = groupDataByMonth(incomeData, false);
			expenseGrouped = groupDataByMonth(expenseData, false);
		} else if (dateRange === "mtd") {
			incomeGrouped = generateMTDDataWithZeros(incomeData);
			expenseGrouped = generateMTDDataWithZeros(expenseData);
		} else if (dateRange === "wtd") {
			const startOfWeek = getStartOfWeek(today, 1);
			const endOfWeek = datetime.endOfDay(today);
			incomeGrouped = generateDailyDataForRange(incomeData, startOfWeek, endOfWeek);
			expenseGrouped = generateDailyDataForRange(expenseData, startOfWeek, endOfWeek);
		} else if (dateRange === "custom" && customRange) {
			const startDate = datetime.startOfDay(customRange.from);
			const endDate = datetime.endOfDay(customRange.to);
			incomeGrouped = generateDailyDataForRange(incomeData, startDate, endDate);
			expenseGrouped = generateDailyDataForRange(expenseData, startDate, endDate);
		} else if (dateRange === "7" || dateRange === "30" || dateRange === "90") {
			const days = parseInt(dateRange, 10);
			incomeGrouped = generateDailyDataWithZeros(incomeData, days);
			expenseGrouped = generateDailyDataWithZeros(expenseData, days);
		} else {
			incomeGrouped = generateDailyDataWithZeros(incomeData, 50);
			expenseGrouped = generateDailyDataWithZeros(expenseData, 50);
		}

		// Merge income and expense by date, calculate net
		const merged = new Map<string, { net: number; isMonthly?: boolean }>();

		for (const item of incomeGrouped) {
			merged.set(item.date, {
				net: item.value,
				isMonthly: item.isMonthly,
			});
		}

		for (const item of expenseGrouped) {
			const existing = merged.get(item.date);
			if (existing) {
				existing.net -= item.value;
				existing.isMonthly = item.isMonthly ?? existing.isMonthly;
			} else {
				merged.set(item.date, {
					net: -item.value,
					isMonthly: item.isMonthly,
				});
			}
		}

		// Calculate cumulative balance (running total)
		const sorted = Array.from(merged.entries())
			.map(([date, values]) => ({
				date,
				net: values.net,
				isMonthly: values.isMonthly,
			}))
			.sort((a, b) => a.date.localeCompare(b.date));

		let balance = 0;
		return sorted.map((item) => {
			balance += item.net;
			return {
				date: item.date,
				net: item.net,
				balance,
				isMonthly: item.isMonthly,
			};
		});
	};

	const data = useMemo(
		() => applyDateGrouping(filteredIncomes, filteredExpenses),
		// oxlint-disable-next-line eslint-plugin-react-hooks/exhaustive-deps
		[filteredIncomes, filteredExpenses],
	);

	const finalBalance = data.length > 0 ? data[data.length - 1].balance : 0;
	const [hoveredBalance, setHoveredBalance] = useState<number | null>(null);
	const displayBalance = hoveredBalance ?? finalBalance;

	// Calculate zero-line ratio for split gradient
	const minBalance = data.length > 0 ? Math.min(...data.map((d) => d.balance)) : 0;
	const maxBalance = data.length > 0 ? Math.max(...data.map((d) => d.balance)) : 0;
	const balanceRange = maxBalance - minBalance;
	const zeroRatio = balanceRange === 0 ? 0.5 : Math.max(0, Math.min(1, maxBalance / balanceRange));

	return (
		<Card
			className={cn(
				"bg-background flex h-full flex-col gap-2 rounded-none border-transparent md:py-3",
			)}
		>
			<CardHeader>
				<CardDescription className="text-xs tracking-wider uppercase">Cash Flow</CardDescription>
				<CardDescription>
					<div className="flex flex-col">
						<div className="flex items-baseline gap-2">
							<CurrencyValue
								value={displayBalance}
								currency={currency}
								className={cn(
									"text-3xl font-medium",
									// displayBalance >= 0 ? "text-foreground" : "text-destructive",
								)}
							/>
						</div>
					</div>
				</CardDescription>
			</CardHeader>
			<CardContent className="h-full flex-1 overflow-hidden p-0">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-full w-full **:focus:outline-none"
				>
					<AreaChart accessibilityLayer data={data} margin={{ left: 5, right: 5, top: 0 }}>
						<defs>
							<linearGradient id="gradient-rounded-chart-desktop" x1="0" y1="0" x2="0" y2="1">
								<stop offset={`${zeroRatio * 100}%`} stopColor="var(--success)" stopOpacity={1} />
								<stop
									offset={`${zeroRatio * 100}%`}
									stopColor="var(--destructive)"
									stopOpacity={1}
								/>
							</linearGradient>
						</defs>
						<rect x="0" y="0" width="100%" height="120%" fill="url(#default-pattern-dots)" />
						<defs>
							<DottedBackgroundPattern />
						</defs>
						<ReferenceLine
							y={0}
							stroke="var(--foreground)"
							strokeWidth={1}
							strokeDasharray="5 5"
							opacity={0.15}
						/>
						<Tooltip
							cursor={{ stroke: "var(--primary)", strokeWidth: 0, strokeDasharray: "none" }}
							content={({ active, payload }) => (
								<TooltipContent
									active={active}
									payload={
										payload as unknown as Array<{ payload: CashFlowDataPoint; value: number }>
									}
									dateRange={dateRange}
									currency={currency}
									setHoveredBalance={setHoveredBalance}
								/>
							)}
						/>
						<Area
							type="monotone"
							dataKey="balance"
							fill="url(#gradient-rounded-chart-desktop)"
							fillOpacity={0.4}
							stroke="var(--foreground)"
							strokeWidth={2}
							opacity={0.5}
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
	dateRange,
	currency,
	setHoveredBalance,
}: {
	active?: boolean;
	payload?: Array<{ payload: CashFlowDataPoint; value: number }>;
	dateRange: PredefinedDateRange;
	currency: string;
	setHoveredBalance: (value: number | null) => void;
}) {
	useEffect(() => {
		if (active && payload && payload.length) {
			setHoveredBalance((payload[0].payload as CashFlowDataPoint).balance);
		} else {
			setHoveredBalance(null);
		}
	}, [active, payload, setHoveredBalance]);

	if (active && payload && payload.length) {
		const dataPoint = payload[0].payload as CashFlowDataPoint;
		const date = datetime.parse(dataPoint.date, "yyyy-MM-dd", new Date());
		const formattedDate =
			dateRange === "ytd" || dateRange === "all" || isMonthBasedRange(dateRange)
				? datetime.format(date, "MMMM yyyy")
				: datetime.format(date, "dd/MM/yyyy");

		// const balance = (payload[0].value as number) ?? 0;
		const net = dataPoint.net;

		return (
			<div className="bg-background rounded-md border p-3 shadow-sm">
				<div className="grid gap-2">
					<span className="text-muted-foreground text-xs tracking-wider uppercase">
						{formattedDate}
					</span>
					{/* <div className="flex items-baseline-last justify-between gap-2">
						<span className="text-sm font-semibold">Balance</span>
						<CurrencyValue
							value={balance}
							currency={currency}
							className={cn(
								"text-sm font-medium",
								balance >= 0 ? "text-primary" : "text-destructive",
							)}
						/>
					</div> */}
					<div className="flex items-baseline justify-between gap-1">
						<p className="text-muted-foreground text-xs">Net</p>
						<CurrencyValue
							value={net}
							currency={currency}
							className={cn(
								"text-sm font-medium",
								// net >= 0 ? "text-success" : "text-destructive"
							)}
						/>
					</div>
				</div>
			</div>
		);
	}
	return null;
}

function DottedBackgroundPattern() {
	return (
		<pattern
			id="default-pattern-dots"
			x="0"
			y="0"
			width="10"
			height="10"
			patternUnits="userSpaceOnUse"
		>
			<circle className="dark:text-muted/40 text-muted" cx="2" cy="2" r="1" fill="currentColor" />
		</pattern>
	);
}
