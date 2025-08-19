import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { datetime } from "@hoalu/common/datetime";
import { Card, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip } from "@hoalu/ui/chart";
import { customDateRangeAtom, type DashboardDateRange, selectDateRangeAtom } from "@/atoms/filters";
import { formatCurrency } from "@/helpers/currency";
import { useWorkspace } from "@/hooks/use-workspace";
import { categoriesQueryOptions, expensesQueryOptions } from "@/services/query-options";

const FALLBACK_COLORS = [
	"#8884d8",
	"#82ca9d",
	"#ffc658",
	"#ff7c7c",
	"#8dd1e1",
	"#d084d0",
	"#ffb347",
	"hsl(var(--chart-1))",
	"hsl(var(--chart-2))",
	"hsl(var(--chart-3))",
	"hsl(var(--chart-4))",
	"hsl(var(--chart-5))",
];

function filterExpensesByRange(
	expenses: any[],
	range: DashboardDateRange,
	customRange?: { from: Date; to: Date },
) {
	if (range === "all") return expenses;

	let startDate: Date;
	let endDate: Date;

	if (range === "custom" && customRange) {
		startDate = new Date(customRange.from);
		endDate = new Date(customRange.to);
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(23, 59, 59, 999);
	} else {
		const days = parseInt(range, 10);
		const today = new Date();
		today.setHours(23, 59, 59, 999);
		const cutoffDate = new Date(today);
		cutoffDate.setDate(cutoffDate.getDate() - days + 1);
		cutoffDate.setHours(0, 0, 0, 0);
		startDate = cutoffDate;
		endDate = today;
	}

	return expenses.filter((expense) => {
		const expenseDate = new Date(expense.date);
		return expenseDate >= startDate && expenseDate <= endDate;
	});
}

export function CategoryBreakdownChart() {
	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);
	const { slug } = useWorkspace();
	const {
		metadata: { currency },
	} = useWorkspace();
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));

	// Get raw expenses data and filter by date range
	const { data: expenses } = useSuspenseQuery({
		...expensesQueryOptions(slug),
		select: (data) =>
			data.map((expense) => {
				return {
					...expense,
					date: datetime.format(expense.date, "yyyy-MM-dd"),
				};
			}),
	});

	const filteredExpenses = filterExpensesByRange(expenses, dateRange, customRange);

	// Calculate category totals from filtered expenses
	const categoryTotals: Record<string, number> = {};
	for (const expense of filteredExpenses) {
		const categoryId = expense.category?.id;
		if (categoryId) {
			const amount = expense.convertedAmount > 0 ? expense.convertedAmount : 0;
			categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + amount;
		}
	}

	// Transform category data for the chart using filtered data
	const allCategoryData = Object.entries(categoryTotals)
		.map(([categoryId, total], index) => {
			const category = categories.find((c) => c.id === categoryId);
			const categoryColor = category?.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
			return {
				id: categoryId,
				name: category?.name || "Unknown",
				value: total,
				color: categoryColor,
			};
		})
		.filter((item) => item.value > 0)
		.sort((a, b) => b.value - a.value);

	// Get top 3 categories and group the rest as "Others"
	const top3Categories = allCategoryData.slice(0, 3);
	const otherCategories = allCategoryData.slice(3);
	const othersTotal = otherCategories.reduce((sum, item) => sum + item.value, 0);

	const categoryData = [...top3Categories];
	if (othersTotal > 0) {
		categoryData.push({
			id: "others",
			name: "Others",
			value: othersTotal,
			color: "#a8a29e",
		});
	}

	const totalAmount = categoryData.reduce((sum, item) => sum + item.value, 0);

	const chartConfig: ChartConfig = categoryData.reduce((config, item) => {
		config[item.id] = {
			label: item.name,
			color: item.color,
		};
		return config;
	}, {} as ChartConfig);

	// Use the actual category colors from API
	const categoryDataWithColors = categoryData.map((item) => ({
		...item,
		fill: item.color,
	}));

	return (
		<Card className="py-0">
			<CardHeader className="!p-0 flex flex-col sm:flex-row">
				<div className="flex flex-1 flex-col justify-center gap-2 px-6 pt-4">
					<CardTitle>By Category</CardTitle>
				</div>
			</CardHeader>
			<CardContent className="px-2 sm:p-6">
				{categoryData.length === 0 ? (
					<div className="flex h-[250px] items-center justify-center text-muted-foreground">
						No data to display
					</div>
				) : (
					<ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={categoryDataWithColors}
									cx="50%"
									cy="50%"
									outerRadius={100}
									innerRadius={50}
									paddingAngle={2}
									dataKey="value"
								>
									{categoryDataWithColors.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.fill} />
									))}
								</Pie>
								<ChartTooltip
									content={({ active, payload }) => {
										if (active && payload && payload.length) {
											const data = payload[0].payload;
											const percentage = ((data.value / totalAmount) * 100).toFixed(1);
											return (
												<div className="rounded-lg border bg-background p-2 shadow-sm">
													<div className="grid gap-2">
														<div className="flex flex-col">
															<span className="text-[0.70rem] text-muted-foreground uppercase">
																{data.name}
															</span>
															<span className="font-bold text-muted-foreground">
																{formatCurrency(data.value, currency)} ({percentage}%)
															</span>
														</div>
													</div>
												</div>
											);
										}
										return null;
									}}
								/>
							</PieChart>
						</ResponsiveContainer>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
