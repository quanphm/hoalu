import { getRouteApi } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";

import type { ColorSchema } from "@hoalu/common/schema";
import { Button } from "@hoalu/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@hoalu/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";

import {
	customDateRangeAtom,
	expenseCategoryFilterAtom,
	selectDateRangeAtom,
} from "#app/atoms/filters.ts";
import type { SyncedCategory } from "#app/components/categories/use-categories.ts";
import { useLiveQueryExpenses } from "#app/components/expenses/use-expenses.ts";
import { createCategoryTheme } from "#app/helpers/colors.ts";
import { filterDataByRange } from "#app/helpers/date-range.ts";
import { useWorkspace } from "#app/hooks/use-workspace.ts";
import { CurrencyValue } from "../currency-value";
import { CreateExpenseDialogTrigger } from "../expenses/expense-actions";

const TOP_N_CATEGORY = 5;

const routeApi = getRouteApi("/_dashboard/$slug");

interface CategoryData {
	id: string;
	name: string;
	value: number;
	color: ColorSchema;
}

interface CategoryBreakdownProps {
	categories: SyncedCategory[];
}

export function CategoryBreakdown(props: CategoryBreakdownProps) {
	const [view, setView] = useState<"less" | "more">("less");
	const {
		metadata: { currency },
	} = useWorkspace();
	const expenses = useLiveQueryExpenses();

	const dateRange = useAtomValue(selectDateRangeAtom);
	const customRange = useAtomValue(customDateRangeAtom);

	const filteredExpenses = filterDataByRange(expenses, dateRange, customRange);

	const categoryTotals: Record<string, number> = {};
	for (const expense of filteredExpenses) {
		const categoryId = expense.category?.id;
		if (categoryId) {
			const amount = expense.convertedAmount > 0 ? expense.convertedAmount : 0;
			categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + amount;
		}
	}

	const allCategoryData: CategoryData[] = Object.entries(categoryTotals)
		.map(([categoryId, total]) => {
			const category = props.categories.find((c) => c.id === categoryId);
			return {
				id: categoryId,
				name: category?.name || "Unknown",
				color: category?.color || "gray",
				value: total,
			};
		})
		.filter((item) => item.value > 0)
		.sort((a, b) => b.value - a.value);

	const topCategories = allCategoryData.slice(0, TOP_N_CATEGORY);
	const otherCategories = allCategoryData.slice(TOP_N_CATEGORY);
	const othersTotal = otherCategories.reduce((sum, item) => sum + item.value, 0);

	const categoryData = [...topCategories];
	if (othersTotal > 0) {
		categoryData.push({
			id: "others",
			name: "Others",
			color: "gray",
			value: othersTotal,
		});
	}

	const handleToggleView = () => {
		setView((state) => (state === "less" ? "more" : "less"));
	};

	const dataToView = view === "less" ? categoryData : allCategoryData;
	const totalAmount = dataToView.reduce((sum, item) => sum + item.value, 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Categories Breakdown</CardTitle>
				<CardDescription>Top {TOP_N_CATEGORY} categories</CardDescription>
				<CardAction>
					{dataToView.length > TOP_N_CATEGORY && (
						<div className="flex justify-end">
							<Button variant="outline" size="sm" onClick={handleToggleView}>
								{view === "less" && "View all"}
								{view === "more" && "View less"}
							</Button>
						</div>
					)}
				</CardAction>
			</CardHeader>
			<CardContent>
				{dataToView.length === 0 ? (
					<EmptyData />
				) : (
					<div className="space-y-4">
						<PercentageBreakdown data={dataToView} totalAmount={totalAmount} />
						<CategoryListBreakdown
							data={dataToView}
							totalAmount={totalAmount}
							currency={currency}
							onToggleView={handleToggleView}
						/>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function PercentageBreakdown(props: { data: CategoryData[]; totalAmount: number }) {
	return (
		<div className="flex h-4 w-full items-center justify-center gap-px overflow-hidden rounded-md">
			{props.data.map((data) => {
				const widthPercentage = (data.value / props.totalAmount) * 100;
				return (
					<div
						key={data.id}
						className={cn(
							"h-full transition-all duration-300",
							createCategoryTheme(data.color),
							"shadow-none dark:shadow-none",
						)}
						style={{
							width: `${widthPercentage}%`,
						}}
					/>
				);
			})}
		</div>
	);
}

function CategoryListBreakdown(props: {
	data: CategoryData[];
	totalAmount: number;
	currency: string;
	onToggleView(): void;
}) {
	const { slug } = routeApi.useParams();
	const navigate = routeApi.useNavigate();
	const customDateRange = useAtomValue(customDateRangeAtom);
	const setSelectedCategories = useSetAtom(expenseCategoryFilterAtom);

	const handleClick = (id: string) => {
		if (id === "others") {
			props.onToggleView();
			return;
		}

		setSelectedCategories([id]);

		if (!customDateRange) {
			navigate({
				to: "/$slug/expenses",
				params: { slug },
			});
		} else {
			const searchQuery = `${customDateRange.from.getTime()}-${customDateRange.to.getTime()}`;
			navigate({
				to: "/$slug/expenses",
				params: { slug },
				search: { date: searchQuery },
			});
		}
	};

	return (
		<div className="divide-y divide-border/60">
			{props.data.map((data) => {
				const percentage = ((data.value / props.totalAmount) * 100).toFixed(1);
				return (
					<div key={data.id} className="flex items-center justify-between py-1">
						<div className="flex items-center gap-3">
							<div className={cn("h-3 w-3 rounded-xs", createCategoryTheme(data.color))} />
							<Button
								variant="link"
								onClick={() => handleClick(data.id)}
								className={cn(
									"h-auto p-0 text-foreground text-sm",
									data.id !== "others" && "underline decoration-dotted underline-offset-3",
								)}
							>
								{data.name}
							</Button>
						</div>
						<div className="text-right">
							<CurrencyValue
								value={data.value}
								currency={props.currency}
								className="font-medium text-sm"
							/>
							<div className="text-muted-foreground text-xs">{percentage}%</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

export function EmptyData() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No Data Yet</EmptyTitle>
				<EmptyDescription>
					You haven&apos;t created any expenses yet. Get started by creating your first expense.
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<div className="flex gap-2">
					<CreateExpenseDialogTrigger variant="default" showKbd={false} />
				</div>
			</EmptyContent>
		</Empty>
	);
}
