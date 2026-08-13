import { Button } from "@hoalu/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@hoalu/ui/chart";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@hoalu/ui/empty";
import { cn } from "@hoalu/ui/utils";
import { getRouteApi } from "@tanstack/react-router";
import { useState } from "react";
import { Pie, PieChart } from "recharts";

import { expenseCategoryFilter$ } from "#app/atoms/filters.ts";
import { CurrencyValue } from "#app/components/currency-value.tsx";
import { createChartColor, createChartColorTheme } from "#app/helpers/colors.ts";

import type { CategoryBreakdownEntry, DashboardModel } from "#app/services/dashboard-model.ts";

const TOP_N_CATEGORY = 5;

const routeApi = getRouteApi("/_dashboard/$slug");

function DonutBreakdown(props: {
	data: CategoryBreakdownEntry[];
	totalAmount: number;
	currency: string;
}) {
	const chartData = props.data.map((item) => ({
		...item,
		fill: `var(--color-${item.id})`,
	}));
	const chartConfig = Object.fromEntries(
		props.data.map((item) => [
			item.id,
			{ label: item.name, theme: createChartColorTheme(item.color) },
		]),
	) satisfies ChartConfig;

	return (
		<ChartContainer config={chartConfig} className="mx-auto aspect-auto h-[165px] w-full">
			<PieChart>
				<ChartTooltip
					isAnimationActive={false}
					content={
						<ChartTooltipContent
							hideLabel
							nameKey="id"
							formatter={(value, _name, item) => (
								<div className="flex w-full items-center gap-2">
									<div
										className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
										style={{ backgroundColor: item.payload.fill }}
									/>
									<span className="text-muted-foreground flex-1">{item.payload.name}</span>
									<CurrencyValue
										value={Number(value)}
										currency={props.currency}
										className="text-xs"
									/>
								</div>
							)}
						/>
					}
				/>
				<Pie
					data={chartData}
					dataKey="value"
					nameKey="id"
					innerRadius="62%"
					outerRadius="90%"
					paddingAngle={2}
					cornerRadius={4}
					isAnimationActive={false}
				/>
			</PieChart>
		</ChartContainer>
	);
}

function CategoryListBreakdown(props: {
	data: CategoryBreakdownEntry[];
	totalAmount: number;
	currency: string;
	customRange: DashboardModel["range"]["custom"];
	onToggleView(): void;
}) {
	const { slug } = routeApi.useParams();
	const navigate = routeApi.useNavigate();
	const setSelectedCategories = expenseCategoryFilter$.set;

	const handleClick = (id: string) => {
		if (id === "others") {
			props.onToggleView();
			return;
		}

		setSelectedCategories([id]);

		if (!props.customRange) {
			navigate({
				to: "/$slug/transactions",
				params: { slug },
			});
		} else {
			const searchQuery = `${props.customRange.from.getTime()}-${props.customRange.to.getTime()}`;
			navigate({
				to: "/$slug/transactions",
				params: { slug },
				search: { date: searchQuery },
			});
		}
	};

	return (
		<div className="divide-border/50 divide-y">
			{props.data.map((data) => {
				const percentage = ((data.value / props.totalAmount) * 100).toFixed(1);
				return (
					<div key={data.id} className="flex items-center gap-3 py-2.5">
						<div className={cn("size-3 shrink-0 rounded-[4px]", createChartColor(data.color))} />
						<Button
							variant="link"
							onClick={() => handleClick(data.id)}
							className="text-foreground h-auto min-w-0 truncate p-0 text-sm font-semibold"
						>
							{data.name}
						</Button>
						<div className="ml-auto flex shrink-0 items-center gap-6">
							<span className="text-muted-foreground w-12 text-right text-sm tabular-nums">
								{percentage}%
							</span>
							<CurrencyValue
								value={data.value}
								currency={props.currency}
								className="text-sm font-semibold tabular-nums"
							/>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function EmptyData() {
	return (
		<Empty>
			<EmptyHeader>
				<EmptyTitle>No data yet</EmptyTitle>
				<EmptyDescription>
					You haven&apos;t created any expenses in this period yet.
				</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}

interface CategoryBreakdownProps {
	model: DashboardModel;
}

export function CategoryBreakdown(props: CategoryBreakdownProps) {
	const { model } = props;
	const [view, setView] = useState<"less" | "more">("less");

	const allCategoryData = model.categories.breakdown;

	const topCategories = allCategoryData.slice(0, TOP_N_CATEGORY);
	const otherCategories = allCategoryData.slice(TOP_N_CATEGORY);
	const othersTotal = otherCategories.reduce((sum, item) => sum + item.value, 0);

	const categoryData: CategoryBreakdownEntry[] = [...topCategories];
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
		<Card className="h-full pb-2">
			<CardHeader>
				<CardTitle className="text-base">Categories Breakdown</CardTitle>
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
					<div className="space-y-6">
						<DonutBreakdown data={dataToView} totalAmount={totalAmount} currency={model.currency} />
						<CategoryListBreakdown
							data={dataToView}
							totalAmount={totalAmount}
							currency={model.currency}
							customRange={model.range.custom}
							onToggleView={handleToggleView}
						/>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
