import { useAtom } from "jotai";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { datetime } from "@hoalu/common/datetime";
import { Button } from "@hoalu/ui/button";
import { Calendar } from "@hoalu/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";
import { type CustomDateRange, customDateRangeAtom } from "@/atoms/filters";

interface DateRangePickerProps {
	onRangeSelect: (range: CustomDateRange) => void;
	className?: string;
}

export function DateRangePicker({ onRangeSelect, className }: DateRangePickerProps) {
	const [customRange, setCustomRange] = useAtom(customDateRangeAtom);
	const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({
		from: customRange?.from,
		to: customRange?.to,
	});

	const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
		if (range) {
			setTempRange(range);
			if (range.from && range.to) {
				const newRange = { from: range.from, to: range.to };
				setCustomRange(newRange);
				onRangeSelect(newRange);
			}
		}
	};

	const formatDateRange = () => {
		if (customRange?.from && customRange?.to) {
			return `${datetime.format(customRange.from, "MMM dd")} - ${datetime.format(customRange.to, "MMM dd, yyyy")}`;
		}
		return "Pick date range";
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" className={`justify-start text-left font-normal ${className}`}>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{formatDateRange()}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="range"
					defaultMonth={tempRange?.from}
					selected={{ from: tempRange?.from, to: tempRange?.to }}
					onSelect={handleSelect}
					numberOfMonths={2}
				/>
			</PopoverContent>
		</Popover>
	);
}
