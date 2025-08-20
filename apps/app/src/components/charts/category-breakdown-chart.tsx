import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { datetime } from "@hoalu/common/datetime";
import { Card, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
import { customDateRangeAtom, type DashboardDateRange, selectDateRangeAtom } from "@/atoms/filters";
import { formatCurrency } from "@/helpers/currency";
import { useWorkspace } from "@/hooks/use-workspace";
import type { ExpenseWithClientConvertedSchema } from "@/lib/schema";
import { categoriesQueryOptions, expensesQueryOptions } from "@/services/query-options";

const FALLBACK_COLORS = [
	"#D97706", // Darker Orange (dominant)
	"#EAB308", // Darker Yellow
	"#DC2626", // Darker Red
	"#0F766E", // Darker Teal
	"#6B7280", // Darker Gray
	"#7C3AED", // Darker Purple
	"#DB2777", // Darker Pink
	"#059669", // Darker Emerald
	"#2563EB", // Darker Blue
	"#EA580C", // Darker Orange variant
	"#65A30D", // Darker Lime
	"#4F46E5", // Darker Indigo
];

function filterExpensesByRange(
	expenses: ExpenseWithClientConvertedSchema[],
	range: DashboardDateRange,
	customRange?: { from: Date; to: Date },
) {
	if (range === "all") return expenses;

	let startDate: Date;
	let endDate: Date;

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

	return expenses.filter((expense) => {
		const expenseDate = datetime.parse(expense.date, "yyyy-MM-dd", new Date());
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
	const { data: expenses } = useSuspenseQuery(expensesQueryOptions(slug));

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

	// Get top 4 categories and group the rest as "Others"
	const top4Categories = allCategoryData.slice(0, 4);
	const otherCategories = allCategoryData.slice(4);
	const othersTotal = otherCategories.reduce((sum, item) => sum + item.value, 0);

	const categoryData = [...top4Categories];
	if (othersTotal > 0) {
		categoryData.push({
			id: "others",
			name: "Others",
			value: othersTotal,
			color: "#a8a29e",
		});
	}

	const totalAmount = categoryData.reduce((sum, item) => sum + item.value, 0);

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
			<CardContent className="px-6 py-4">
				{categoryData.length === 0 ? (
					<div className="flex h-[250px] items-center justify-center text-muted-foreground">
						No data to display
					</div>
				) : (
					<div className="space-y-6">
						<div className="flex h-6 w-full gap-1 overflow-hidden bg-muted">
							{categoryDataWithColors.map((category) => {
								const widthPercentage = (category.value / totalAmount) * 100;
								return (
									<div
										key={category.id}
										className="h-full transition-all duration-300"
										style={{
											backgroundColor: category.color,
											width: `${widthPercentage}%`,
										}}
									/>
								);
							})}
						</div>

						{/* Category list with percentages */}
						<div className="divide-y divide-border/60">
							{categoryDataWithColors.map((category) => {
								const percentage = ((category.value / totalAmount) * 100).toFixed(1);
								return (
									<div key={category.id} className="flex items-center justify-between py-1">
										<div className="flex items-center gap-3">
											<div
												className="h-2 w-2 rounded-full"
												style={{ backgroundColor: category.color }}
											/>
											<span className="text-foreground text-sm">{category.name}</span>
										</div>
										<div className="text-right">
											<div className="font-medium text-sm">
												{formatCurrency(category.value, currency)}
											</div>
											<div className="text-muted-foreground text-xs">{percentage}%</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
