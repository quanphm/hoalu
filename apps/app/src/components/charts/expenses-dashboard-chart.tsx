import { getRouteApi } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { datetime } from "@hoalu/common/datetime";
import { Card, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@hoalu/ui/chart";
import { customDateRangeAtom, selectDateRangeAtom } from "@/atoms/filters";
import { filterDataByRange } from "@/helpers/date-range";
import { useExpenseStats } from "@/hooks/use-expenses";
import { useWorkspace } from "@/hooks/use-workspace";
import { CurrencyValue } from "../currency-value";

const chartConfig = {
	value: {
		label: "Total expense",
	},
	date: {
		label: "Expense",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

function groupDataByMonth(data: { date: string; value: number }[], isYTD = false) {
	const monthlyData: Record<string, number> = {};
	const today = new Date();

	if (isYTD) {
		// For YTD, initialize from January to current month
		const currentMonth = today.getMonth();
		for (let i = 0; i <= currentMonth; i++) {
			const monthDate = new Date(today.getFullYear(), i, 1);
			const monthKey = datetime.format(monthDate, "yyyy-MM");
			monthlyData[monthKey] = 0;
		}
	} else {
		// For "All time", initialize all 12 months (12 months from today backwards)
		for (let i = 11; i >= 0; i--) {
			const monthDate = new Date(today);
			monthDate.setMonth(monthDate.getMonth() - i);
			const monthKey = datetime.format(monthDate, "yyyy-MM");
			monthlyData[monthKey] = 0;
		}
	}

	// Aggregate actual data by month
	for (const item of data) {
		const date = datetime.parse(item.date, "yyyy-MM-dd", new Date());
		const monthKey = datetime.format(date, "yyyy-MM");

		if (monthlyData[monthKey] !== undefined) {
			monthlyData[monthKey] += item.value;
		}
	}

	return Object.entries(monthlyData)
		.map(([monthKey, value]) => ({
			date: `${monthKey}-01`,
			value,
			isMonthly: true, // Flag to identify monthly data
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
}

const routeApi = getRouteApi("/_dashboard/$slug");

export function ExpenseDashboardChart() {
	const { slug } = routeApi.useParams();
	const navigate = routeApi.useNavigate();
	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);
	const stats = useExpenseStats();
	const {
		metadata: { currency },
	} = useWorkspace();

	const filteredData = filterDataByRange(stats.aggregation.byDate, dateRange, customRange);

	// Helper function to generate daily data with zeros for missing dates
	function generateDailyDataWithZeros(data: { date: string; value: number }[], days: number) {
		const today = new Date();
		const dailyData: Record<string, number> = {};

		// Initialize all days in range with zero
		for (let i = days - 1; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(date.getDate() - i);
			const dateKey = datetime.format(date, "yyyy-MM-dd");
			dailyData[dateKey] = 0;
		}

		// Fill in actual data
		for (const item of data) {
			if (dailyData[item.date] !== undefined) {
				dailyData[item.date] = item.value;
			}
		}

		return Object.entries(dailyData)
			.map(([date, value]) => ({ date, value }))
			.sort((a, b) => a.date.localeCompare(b.date));
	}

	// Helper function to generate daily data for month-to-date
	function generateMTDDataWithZeros(data: { date: string; value: number }[]) {
		const today = new Date();
		const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		const dailyData: Record<string, number> = {};

		// Initialize all days from 1st of month to today with zero
		const currentDate = new Date(firstOfMonth);
		while (currentDate <= today) {
			const dateKey = datetime.format(currentDate, "yyyy-MM-dd");
			dailyData[dateKey] = 0;
			currentDate.setDate(currentDate.getDate() + 1);
		}

		// Fill in actual data
		for (const item of data) {
			if (dailyData[item.date] !== undefined) {
				dailyData[item.date] = item.value;
			}
		}

		return Object.entries(dailyData)
			.map(([date, value]) => ({ date, value }))
			.sort((a, b) => a.date.localeCompare(b.date));
	}

	// Helper function to get start of week
	function getStartOfWeek(date: Date, weekStartsOn: number = 1): Date {
		const day = date.getDay();
		const diff = day < weekStartsOn ? day + 7 - weekStartsOn : day - weekStartsOn;
		const startOfWeek = new Date(date);
		startOfWeek.setDate(date.getDate() - diff);
		return datetime.startOfDay(startOfWeek);
	}

	// Helper function to generate daily data for a specific date range
	function generateDailyDataForRange(
		data: { date: string; value: number }[],
		startDate: Date,
		endDate: Date,
	): { date: string; value: number }[] {
		const dailyData: Record<string, number> = {};

		// Initialize all days in range with zero
		const currentDate = new Date(datetime.startOfDay(startDate));
		const normalizedEndDate = datetime.endOfDay(endDate);

		while (currentDate <= normalizedEndDate) {
			const dateKey = datetime.format(currentDate, "yyyy-MM-dd");
			dailyData[dateKey] = 0;
			currentDate.setDate(currentDate.getDate() + 1);
		}

		// Fill in actual data
		for (const item of data) {
			if (dailyData[item.date] !== undefined) {
				dailyData[item.date] = item.value;
			}
		}

		return Object.entries(dailyData)
			.map(([date, value]) => ({ date, value }))
			.sort((a, b) => a.date.localeCompare(b.date));
	}

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
		} else if (dateRange === "7" || dateRange === "30") {
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

	return (
		<Card className="py-0">
			<CardHeader className="!p-0 flex flex-col sm:flex-row">
				<div className="flex flex-1 flex-col justify-center gap-4 px-6 pt-4">
					<CardTitle>Expenses</CardTitle>
					<CurrencyValue value={totalExpenses} currency={currency} style="decimal" />
				</div>
			</CardHeader>
			<CardContent className="px-2 sm:p-6">
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[250px] w-full [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-[var(--chart-1)]/15"
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
							ticks={data.length > 0 ? [data[0].date, data[data.length - 1].date] : []}
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
														className="font-bold text-base"
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
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
