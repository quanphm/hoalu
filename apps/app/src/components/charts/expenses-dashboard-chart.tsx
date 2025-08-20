import { getRouteApi } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { datetime } from "@hoalu/common/datetime";
import { Card, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@hoalu/ui/chart";
import { customDateRangeAtom, type DashboardDateRange, selectDateRangeAtom } from "@/atoms/filters";
import { formatCurrency } from "@/helpers/currency";
import { useExpenseStats } from "@/hooks/use-expenses";
import { useWorkspace } from "@/hooks/use-workspace";

const chartConfig = {
	value: {
		label: "Total expense",
	},
	date: {
		label: "Expense",
		color: "var(--chart-2)",
	},
} satisfies ChartConfig;

function filterDataByRange(
	data: { date: string; value: number }[],
	range: DashboardDateRange,
	customRange?: { from: Date; to: Date },
) {
	if (range === "all") {
		return data;
	}

	let startDate: Date, endDate: Date;

	if (range === "custom" && customRange) {
		startDate = datetime.startOfDay(customRange.from);
		endDate = datetime.endOfDay(customRange.to);
	} else if (range === "wtd") {
		// Week to date (Monday to today)
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const dayOfWeek = today.getDay();
		const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, Monday is 1
		const monday = new Date(today);
		monday.setDate(monday.getDate() - daysFromMonday);
		startDate = datetime.startOfDay(monday);
	} else if (range === "mtd") {
		// Month to date (1st of current month to today)
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		startDate = datetime.startOfDay(firstOfMonth);
	} else if (range === "ytd") {
		// Year to date (12 months from today)
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const twelveMonthsAgo = new Date(today);
		twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
		startDate = datetime.startOfDay(twelveMonthsAgo);
	} else {
		const days = parseInt(range, 10);
		const today = new Date();
		endDate = datetime.endOfDay(today);
		const cutoffDate = new Date(today);
		cutoffDate.setDate(cutoffDate.getDate() - days + 1);
		startDate = datetime.startOfDay(cutoffDate);
	}

	// Sort data by date first to ensure proper ordering
	const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

	const filtered = sortedData.filter((item) => {
		const itemDate = datetime.parse(item.date, "yyyy-MM-dd", new Date());
		return itemDate >= startDate && itemDate <= endDate;
	});

	return filtered;
}

function groupDataByMonth(data: { date: string; value: number }[]) {
	const monthlyData: Record<string, number> = {};

	// Initialize all 12 months with 0 values (12 months from today backwards)
	const today = new Date();
	for (let i = 11; i >= 0; i--) {
		const monthDate = new Date(today);
		monthDate.setMonth(monthDate.getMonth() - i);
		const monthKey = datetime.format(monthDate, "yyyy-MM");
		monthlyData[monthKey] = 0;
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

	// Group by month for year-to-date and all-time views
	const data =
		dateRange === "ytd" || dateRange === "all"
			? groupDataByMonth(filteredData)
			: filteredData.slice(-50);

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
				<div className="flex flex-1 flex-col justify-center gap-2 px-6 pt-4">
					<CardTitle>Expenses</CardTitle>
					<div className="font-semibold text-2xl">{formatCurrency(totalExpenses, currency)}</div>
				</div>
			</CardHeader>
			<CardContent className="px-2 sm:p-6">
				{data.length === 0 ? (
					<div className="flex h-60 items-center justify-center text-muted-foreground">
						No data to display
					</div>
				) : (
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
								ticks={[data[0].date, data[data.length - 1].date]}
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
														<span className="font-bold text-base">
															{formatCurrency(payload[0].value, currency)}
														</span>
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
								fill={`var(--color-date)`}
								onClick={handleBarClick}
								className="cursor-pointer"
							/>
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
