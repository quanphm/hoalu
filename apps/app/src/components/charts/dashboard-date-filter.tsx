import { useAtom, useSetAtom } from "jotai";

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
	customDateRangeAtom,
	type DashboardDateRange,
	selectDateRangeAtom,
} from "@/atoms/filters";
import { AVAILABLE_LAST_RANGE_OPTIONS, AVAILABLE_TO_DATE_RANGE_OPTIONS } from "@/helpers/constants";
import { DateRangePicker } from "./date-range-picker";

export function DashboardDateFilter() {
	const [dateRange, setDateRange] = useAtom(selectDateRangeAtom);
	const setCustomRange = useSetAtom(customDateRangeAtom);

	const handleRangeChange = (value: DashboardDateRange) => {
		setDateRange(value);
		if (value !== "custom") {
			setCustomRange(undefined);
		}
	};

	const handleCustomRangeSelect = (range: CustomDateRange) => {
		setCustomRange(range);
		setDateRange("custom");
	};

	return (
		<div className="flex items-center gap-3">
			<div className="flex items-center gap-2">
				<Select value={dateRange} onValueChange={handleRangeChange}>
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
				{dateRange === "custom" && <DateRangePicker onRangeSelect={handleCustomRangeSelect} />}
			</div>
		</div>
	);
}
