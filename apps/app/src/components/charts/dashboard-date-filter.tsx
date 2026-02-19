import {
	type ChartGroupBy,
	type CustomDateRange,
	chartCategoryFilterAtom,
	chartGroupByAtom,
	type PredefinedDateRange,
	selectDateRangeAtom,
	syncedDateRangeAtom,
} from "#app/atoms/filters.ts";
import type { SyncedCategory } from "#app/components/categories/use-categories.ts";
import { createChartColor } from "#app/helpers/colors.ts";
import {
	AVAILABLE_LAST_DAYS_OPTIONS,
	AVAILABLE_LAST_MONTHS_OPTIONS,
	AVAILABLE_TO_DATE_RANGE_OPTIONS,
} from "#app/helpers/constants.ts";
import { CheckIcon, LayersIcon } from "@hoalu/icons/lucide";
import { Button } from "@hoalu/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";
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

import { DateRangePicker } from "./date-range-picker.tsx";

const options = [
	...AVAILABLE_LAST_DAYS_OPTIONS,
	...AVAILABLE_LAST_MONTHS_OPTIONS,
	...AVAILABLE_TO_DATE_RANGE_OPTIONS,
	{ label: "Custom range", value: "custom" },
];

interface DashboardDateFilterProps {
	categories: SyncedCategory[];
}

export function DashboardDateFilter(props: DashboardDateFilterProps) {
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
		<div className="flex items-center gap-4">
			<Select<PredefinedDateRange> value={predefinedDateRange} onValueChange={handleRangeChange}>
				<SelectTrigger className="w-auto min-w-0 shrink-0">
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
			<ChartCategoryFilter categories={props.categories} />
			{predefinedDateRange === "custom" && <ChartGroupByFilter />}
			<DateRangePicker onRangeSelect={handleCustomRangeSelect} className="min-w-0 shrink" />
		</div>
	);
}

function ChartGroupByFilter() {
	const [groupBy, setGroupBy] = useAtom(chartGroupByAtom);

	const handleGroupByChange = (value: ChartGroupBy | null) => {
		if (value) {
			setGroupBy(value);
		}
	};

	return (
		<Select<ChartGroupBy> value={groupBy} onValueChange={handleGroupByChange}>
			<SelectTrigger className="w-auto min-w-0 shrink-0">
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
		<div className="flex items-center gap-1">
			<Popover>
				<PopoverTrigger
					render={<Button variant={hasSelection ? "default" : "outline"} className="gap-1.5" />}
				>
					<LayersIcon className="size-3.5" />
					<span>
						{hasSelection
							? `${selectedIds.length} ${selectedIds.length === 1 ? "category" : "categories"}`
							: "By category"}
					</span>
				</PopoverTrigger>
				<PopoverContent className="w-56 p-0" align="start">
					<div className="border-b px-3 py-2">
						<p className="text-sm font-medium">Filter by category</p>
						<p className="text-muted-foreground text-xs">Select categories to compare</p>
					</div>
					<div
						className={cn(
							"divide-border/60 divide-y",
							categories.length > 6 && "max-h-[200px] overflow-y-auto",
						)}
					>
						{categories.map((category) => {
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
		</div>
	);
}
