import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { Card, CardContent } from "@hoalu/ui/card";
import { customDateRangeAtom, selectDateRangeAtom } from "@/atoms/filters";
import { formatCurrency } from "@/helpers/currency";
import { filterDataByRange } from "@/helpers/date-range";
import { useWorkspace } from "@/hooks/use-workspace";
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

export function CategoryBreakdownChart() {
	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);
	const { slug } = useWorkspace();
	const {
		metadata: { currency },
	} = useWorkspace();
	const { data: categories } = useSuspenseQuery(categoriesQueryOptions(slug));
	const { data: expenses } = useSuspenseQuery(expensesQueryOptions(slug));

	const filteredExpenses = filterDataByRange(expenses, dateRange, customRange);

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
			<CardContent className="px-6 py-4">
				<div className="flex items-center justify-between">
					<span className="font-medium text-muted-foreground text-sm">By Category</span>
				</div>
				<div className="mt-2">
					{categoryData.length === 0 ? (
						<div className="flex h-[250px] items-center justify-center text-muted-foreground">
							No data to display
						</div>
					) : (
						<div className="space-y-4">
							<div className="flex h-6 w-full gap-1 overflow-hidden">
								{categoryDataWithColors.map((category) => {
									const widthPercentage = (category.value / totalAmount) * 100;
									return (
										<div
											key={category.id}
											className="h-full rounded-xs transition-all duration-300"
											style={{
												backgroundColor: category.color,
												width: `${widthPercentage}%`,
											}}
										/>
									);
								})}
							</div>
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
				</div>
			</CardContent>
		</Card>
	);
}
