import {
	type ChartGroupBy,
	type CustomDateRange,
	chartCategoryFilterAtom,
	chartGroupByAtom,
	type PredefinedDateRange,
	selectDateRangeAtom,
	syncedDateRangeAtom,
} from "#app/atoms/filters.ts";
import { DateRangePicker } from "#app/components/charts/date-range-picker.tsx";
import { createChartColor } from "#app/helpers/colors.ts";
import {
	AVAILABLE_LAST_DAYS_OPTIONS,
	AVAILABLE_LAST_MONTHS_OPTIONS,
	AVAILABLE_TO_DATE_RANGE_OPTIONS,
} from "#app/helpers/constants.ts";
import { CheckIcon, LayersIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "@hoalu/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@hoalu/ui/select";
import { cn } from "@hoalu/ui/utils";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import type { SyncedCategory } from "#app/components/categories/use-categories.ts";

const options = [
	...AVAILABLE_LAST_DAYS_OPTIONS,
	...AVAILABLE_LAST_MONTHS_OPTIONS,
	...AVAILABLE_TO_DATE_RANGE_OPTIONS,
	{ label: "Custom range", value: "custom" },
];

export function DashboardDateFilter() {
	const predefinedDateRange = useAtomValue(selectDateRangeAtom);
	const setSyncedDateRange = useSetAtom(syncedDateRangeAtom);

	const handleRangeChange = (value: PredefinedDateRange | null) => {
		// Select component can pass null when clearing, though not used in this implementation
		if (value) {
			setSyncedDateRange({ selected: value });
		}
	};

	const handleCustomRangeSelect = (range: CustomDateRange) => {
		setSyncedDateRange({ custom: range });
	};

	return (
		<div
			data-slot="chart-date-filter"
			className={cn(
				"@container/date-filter flex items-center gap-2",
				"not-has-data-[slot=chart-group-by]:grid-cols-3",
			)}
		>
			<Select<PredefinedDateRange> value={predefinedDateRange} onValueChange={handleRangeChange}>
				<SelectTrigger size="sm" className="w-auto py-[calc(--spacing(1)-1px)]">
					<SelectValue>
						{(value: string) => {
							const find = options.find((v) => v.value === value);
							return find?.label;
						}}
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{AVAILABLE_LAST_DAYS_OPTIONS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
					<SelectSeparator />
					{AVAILABLE_LAST_MONTHS_OPTIONS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
					<SelectSeparator />
					{AVAILABLE_TO_DATE_RANGE_OPTIONS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
					<SelectSeparator />
					<SelectItem key={"custom"} value={"custom"}>
						Custom range
					</SelectItem>
				</SelectContent>
			</Select>
			<DateRangePicker onRangeSelect={handleCustomRangeSelect} size="sm" />
		</div>
	);
}

function ChartGroupByFilter() {
	const dateRangeValue = useAtomValue(syncedDateRangeAtom);
	const [groupBy, setGroupBy] = useAtom(chartGroupByAtom);
	const handleGroupByChange = (value: ChartGroupBy | null) => {
		setGroupBy(value ?? "month");
	};

	const customFrom = dateRangeValue.custom?.from;
	const customTo = dateRangeValue.custom?.to;

	useEffect(() => {
		if (!customFrom || !customTo) return;
		const diffDays = (customTo.getTime() - customFrom.getTime()) / (1000 * 60 * 60 * 24);
		setGroupBy(diffDays > 30 ? "month" : "date");
	}, [customFrom, customTo, setGroupBy]);

	return (
		<Select<ChartGroupBy> value={groupBy} onValueChange={handleGroupByChange}>
			<SelectTrigger size="sm" className="w-auto min-w-0 shrink text-xs sm:text-sm">
				<SelectValue>
					{(value: ChartGroupBy) => {
						return value === "date" ? "By date" : "By month";
					}}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="date">By date</SelectItem>
				<SelectItem value="month">By month</SelectItem>
			</SelectContent>
		</Select>
	);
}

function ChartCategoryFilter({ categories }: { categories: SyncedCategory[] }) {
	const [selectedIds, setSelectedIds] = useAtom(chartCategoryFilterAtom);

	const toggleCategory = (id: string) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
		);
	};

	const hasSelection = selectedIds.length > 0;

	return (
		<Popover>
			<PopoverTrigger render={<Button size="sm" variant={hasSelection ? "default" : "outline"} />}>
				<LayersIcon />
				{hasSelection
					? `${selectedIds.length} ${selectedIds.length === 1 ? "category" : "categories"}`
					: "By category"}
			</PopoverTrigger>
			<PopoverContent className="w-56 p-0" align="start">
				<div className="border-b px-3 py-2">
					<PopoverTitle className="text-sm font-medium">Filter by category</PopoverTitle>
					<PopoverDescription className="text-muted-foreground text-xs">
						Select categories to compare
					</PopoverDescription>
				</div>
				<div
					className={cn(
						"divide-border/60 divide-y",
						categories.length > 6 && "max-h-[200px] overflow-y-auto",
					)}
				>
					{categories
						.filter((category) => category.type === "expense")
						.map((category) => {
							const isSelected = selectedIds.includes(category.id);
							return (
								<button
									key={category.id}
									type="button"
									onClick={() => toggleCategory(category.id)}
									className="hover:bg-muted/50 flex w-full items-center gap-2 px-3 py-2 text-left text-sm outline-none"
								>
									<div
										className={cn(
											"flex size-4 shrink-0 items-center justify-center rounded-xs border",
											isSelected
												? "border-primary bg-primary text-primary-foreground"
												: "border-muted-foreground/30",
										)}
									>
										{isSelected && <CheckIcon className="size-3" />}
									</div>
									<div
										className={cn(
											"size-2.5 shrink-0 rounded-full",
											createChartColor(category.color),
										)}
									/>
									<span className="truncate">{category.name}</span>
								</button>
							);
						})}
				</div>
			</PopoverContent>
		</Popover>
	);
}

export { ChartCategoryFilter, ChartGroupByFilter };
