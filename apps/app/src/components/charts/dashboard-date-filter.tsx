import { CalendarBlankIcon, CaretDownIcon, CheckIcon, StackIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import { RangeCalendar } from "@hoalu/ui/calendar-range";
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
import { useValue } from "@legendapp/state/react";
import { type ComponentProps, Fragment, useEffect, useState } from "react";

import {
	type ChartGroupBy,
	chartCategoryFilter$,
	chartGroupBy$,
	customDateRange$,
	type PredefinedDateRange,
	selectDateRange$,
	setSyncedDateRange,
	syncedDateRange$,
} from "#app/atoms/filters.ts";
import { createChartColor } from "#app/helpers/colors.ts";
import {
	AVAILABLE_LAST_DAYS_OPTIONS,
	AVAILABLE_LAST_MONTHS_OPTIONS,
	AVAILABLE_TO_DATE_RANGE_OPTIONS,
} from "#app/helpers/constants.ts";
import { formatDate, formatDateRange } from "#app/helpers/format-date.ts";

import type { SyncedCategory } from "#app/components/categories/use-categories.ts";

/** One list, split once: the separator in the menu and the label lookup read the same source. */
const presetGroups = [
	[...AVAILABLE_LAST_DAYS_OPTIONS, ...AVAILABLE_LAST_MONTHS_OPTIONS],
	AVAILABLE_TO_DATE_RANGE_OPTIONS,
] as const;

const presetOptions = presetGroups.flat();

const CUSTOM = "custom" satisfies PredefinedDateRange;

type RangeValue = ComponentProps<typeof RangeCalendar>["value"];

function rangeOptionLabel(value: PredefinedDateRange): string {
	if (value === CUSTOM) return "Custom";
	return presetOptions.find((option) => option.value === value)?.label ?? "Custom";
}

export function DashboardDateFilter() {
	const selected = useValue(selectDateRange$);
	const customRange = useValue(customDateRange$);
	const [open, setOpen] = useState(false);
	/** The last reported range, including a start with no end yet. */
	const [picked, setPicked] = useState<RangeValue>();

	const range = picked ?? customRange ?? undefined;

	const label =
		selected === "all"
			? "All time"
			: customRange
				? formatDateRange(customRange.from, customRange.to)
				: "Select a range";

	const picking = Boolean(range?.from && !range?.to);

	const status = range?.from
		? range.to
			? formatDateRange(range.from, range.to)
			: `${formatDate(range.from)} – ?`
		: "Pick a start date";

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) setPicked(undefined);
	};

	const applyPreset = (value: PredefinedDateRange | null) => {
		if (!value) return;
		setSyncedDateRange({ selected: value });
		setPicked(undefined);
		setOpen(false);
	};

	const applyRange = (next: RangeValue) => {
		if (!next?.from) {
			setPicked(undefined);
			return;
		}
		if (!next.to) {
			setPicked(next);
			return;
		}
		setSyncedDateRange({ selected: CUSTOM, custom: { from: next.from, to: next.to } });
		setPicked(undefined);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger
				render={
					<Button variant="outline" size="sm" className="max-w-full min-w-0 gap-2 font-normal" />
				}
			>
				<CalendarBlankIcon className="text-muted-foreground size-3.5 shrink-0" />
				<span className="truncate tabular-nums">{label}</span>
				<CaretDownIcon className="text-muted-foreground size-3 shrink-0" />
			</PopoverTrigger>
			<PopoverContent className="w-64 p-0" align="start">
				<div className="p-2">
					<Select<PredefinedDateRange> value={selected} onValueChange={applyPreset}>
						<SelectTrigger size="sm" aria-label="Date range">
							<SelectValue>{(value: PredefinedDateRange) => rangeOptionLabel(value)}</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{presetGroups.map((group, index) => (
								<Fragment key={group[0].value}>
									{index > 0 && <SelectSeparator />}
									{group.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</Fragment>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="border-t p-2">
					<div
						className={cn(
							"mb-1 truncate text-xs leading-4 tabular-nums",
							picking ? "text-foreground" : "text-muted-foreground",
						)}
						aria-live="polite"
					>
						{status}
					</div>
					<RangeCalendar
						className="w-full p-0"
						numberOfMonths={1}
						captionLayout="dropdown"
						defaultMonth={customRange?.from}
						value={range}
						onChange={applyRange}
					/>
				</div>
			</PopoverContent>
		</Popover>
	);
}

function ChartGroupByFilter() {
	const dateRangeValue = useValue(syncedDateRange$);
	const groupBy = useValue(chartGroupBy$);
	const handleGroupByChange = (value: ChartGroupBy | null) => {
		chartGroupBy$.set(value ?? "month");
	};

	const customFrom = dateRangeValue.custom?.from;
	const customTo = dateRangeValue.custom?.to;

	useEffect(() => {
		if (!customFrom || !customTo) return;
		const diffDays = (customTo.getTime() - customFrom.getTime()) / (1000 * 60 * 60 * 24);
		chartGroupBy$.set(diffDays > 30 ? "month" : "date");
	}, [customFrom, customTo]);

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
	const selectedIds = useValue(chartCategoryFilter$);
	const toggleCategory = (id: string) => {
		chartCategoryFilter$.set((prev) =>
			prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
		);
	};

	const hasSelection = selectedIds.length > 0;

	return (
		<Popover>
			<PopoverTrigger render={<Button size="sm" variant={hasSelection ? "default" : "outline"} />}>
				<StackIcon />
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
									className="[@media(hover:hover)_and_(pointer:fine)]:hover:bg-muted/50 flex w-full items-center gap-2 px-3 py-2 text-left text-sm outline-none"
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
