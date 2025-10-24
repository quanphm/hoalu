import { useAtomValue, useSetAtom } from "jotai";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
} from "@hoalu/ui/select";

import {
	type CustomDateRange,
	type PredefinedDateRange,
	selectDateRangeAtom,
	syncedDateRangeAtom,
} from "#app/atoms/filters.ts";
import {
	AVAILABLE_LAST_RANGE_OPTIONS,
	AVAILABLE_TO_DATE_RANGE_OPTIONS,
} from "#app/helpers/constants.ts";
import { DateRangePicker } from "./date-range-picker";

const options = [
	...AVAILABLE_LAST_RANGE_OPTIONS,
	...AVAILABLE_TO_DATE_RANGE_OPTIONS,
	{ label: "Custom range", value: "custom" },
];

export function DashboardDateFilter() {
	const predefinedDateRange = useAtomValue(selectDateRangeAtom);
	const setSyncedDateRange = useSetAtom(syncedDateRangeAtom);

	const handleRangeChange = (value: PredefinedDateRange) => {
		setSyncedDateRange({ selected: value });
	};

	const handleCustomRangeSelect = (range: CustomDateRange) => {
		setSyncedDateRange({ custom: range });
	};

	return (
		<div className="flex items-center gap-3">
			<div className="flex items-center gap-2">
				<Select<PredefinedDateRange> value={predefinedDateRange} onValueChange={handleRangeChange}>
					<SelectTrigger className="min-w-[160px]">
						<SelectValue>
							{(value: string) => {
								const find = options.find((v) => v.value === value);
								return find?.label;
							}}
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{AVAILABLE_LAST_RANGE_OPTIONS.map((option) => (
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
				<DateRangePicker onRangeSelect={handleCustomRangeSelect} />
			</div>
		</div>
	);
}
