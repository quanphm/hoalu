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
} from "@/atoms/filters";
import { AVAILABLE_LAST_RANGE_OPTIONS, AVAILABLE_TO_DATE_RANGE_OPTIONS } from "@/helpers/constants";
import { DateRangePicker } from "./date-range-picker";

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
				<Select value={predefinedDateRange} onValueChange={handleRangeChange}>
					<SelectTrigger className="min-w-[160px]">
						<SelectValue />
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
				{predefinedDateRange === "custom" && (
					<DateRangePicker onRangeSelect={handleCustomRangeSelect} />
				)}
			</div>
		</div>
	);
}
