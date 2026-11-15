import { Button } from "@hoalu/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@hoalu/ui/card";
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

export function CategoryBreakdown(props: { model: DashboardModel }) {
	const { model } = props;
	const { slug } = routeApi.useParams();
	const navigate = routeApi.useNavigate();
	const setSelectedCategories = expenseCategoryFilter$.set;

	const all = model.categories.breakdown;
	const top = all.slice(0, TOP_N_CATEGORY);
	const rest = all.slice(TOP_N_CATEGORY);
	const restTotal = rest.reduce((sum, item) => sum + item.value, 0);
	const [expanded, setExpanded] = useState(false);

	const rows: CategoryBreakdownEntry[] =
		restTotal > 0
			? [...top, { id: "others", name: "Others", color: "gray", value: restTotal }]
			: [...top];

	const total = all.reduce((sum, item) => sum + item.value, 0);

	const openCategory = (id: string) => {
		setSelectedCategories([id]);
		const range = model.range.custom;
		navigate({
			to: "/$slug/transactions",
			params: { slug },
			search: range ? { date: `${range.from.getTime()}-${range.to.getTime()}` } : {},
		});
	};

	return (
		<Card className="flex h-full flex-col">
			<CardHeader>
				<CardTitle className="text-base">Categories</CardTitle>
			</CardHeader>
			<CardContent className="flex-1">
				{rows.length === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyTitle>No data yet</EmptyTitle>
							<EmptyDescription>
								You haven&apos;t created any expenses in this period yet.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<div className="grid h-full items-center gap-6 md:grid-cols-[minmax(0,240px)_1fr]">
						<Donut data={rows} currency={model.currency} />
						<ul className="grid gap-x-8 sm:grid-cols-2">
							{top.map((row) => (
								<li key={row.id} className="border-border/50 flex min-w-0 items-center border-b">
									<LegendRow
										row={row}
										total={total}
										currency={model.currency}
										onOpen={() => openCategory(row.id)}
									/>
								</li>
							))}
							{rest.length > 0 && (
								<li className="sm:col-span-2">
									<div className="border-border/50 border-b">
										<LegendRow
											row={{
												id: "others",
												name: "Others",
												color: "gray",
												value: restTotal,
											}}
											total={total}
											currency={model.currency}
											toggle={{ expanded }}
											onOpen={() => setExpanded((value) => !value)}
										/>
									</div>
									{expanded && (
										<ul className="grid gap-x-8 pb-1 pl-4 sm:grid-cols-2">
											{rest.map((row) => (
												<li
													key={row.id}
													className="border-border/50 flex min-w-0 items-center border-b"
												>
													<LegendRow
														row={row}
														total={total}
														currency={model.currency}
														onOpen={() => openCategory(row.id)}
													/>
												</li>
											))}
										</ul>
									)}
								</li>
							)}
						</ul>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function Donut({ data, currency }: { data: CategoryBreakdownEntry[]; currency: string }) {
	const chartData = data.map((item) => ({ ...item, fill: `var(--color-${item.id})` }));
	const chartConfig = Object.fromEntries(
		data.map((item) => [item.id, { label: item.name, theme: createChartColorTheme(item.color) }]),
	) satisfies ChartConfig;

	return (
		<ChartContainer config={chartConfig} className="mx-auto aspect-auto h-[200px] w-full">
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
									<CurrencyValue value={Number(value)} currency={currency} className="text-xs" />
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

function LegendRow({
	row,
	total,
	currency,
	toggle,
	onOpen,
}: {
	row: CategoryBreakdownEntry;
	total: number;
	currency: string;
	toggle?: { expanded: boolean };
	onOpen: () => void;
}) {
	const share = total > 0 ? ((row.value / total) * 100).toFixed(1) : "0.0";

	const content = (
		<>
			<span className={cn("size-2.5 shrink-0 rounded-[3px]", createChartColor(row.color))} />
			<span
				className={cn(
					"min-w-0 flex-1 text-sm font-medium",
					toggle
						? "decoration-muted-foreground underline decoration-dashed underline-offset-2"
						: "truncate",
				)}
			>
				{row.name}
			</span>
			<span className="text-muted-foreground w-11 shrink-0 text-right text-sm tabular-nums">
				{share}%
			</span>
			<CurrencyValue
				value={row.value}
				currency={currency}
				className="w-24 shrink-0 text-right text-sm font-semibold"
			/>
		</>
	);

	return (
		<Button
			variant="ghost"
			onClick={onOpen}
			aria-expanded={toggle?.expanded}
			className="focus-visible:ring-ring h-auto w-full justify-start gap-3 rounded-sm px-0 py-2.5 text-left font-normal hover:bg-transparent"
		>
			{content}
		</Button>
	);
}
