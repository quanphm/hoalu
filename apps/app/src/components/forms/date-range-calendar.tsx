import { datetime } from "@hoalu/common/datetime";
import { CalendarIcon } from "@hoalu/icons/tabler";
import { Calendar } from "@hoalu/ui/calendar";
import { Field, FieldLabel } from "@hoalu/ui/field";
import { Input } from "@hoalu/ui/input";
import { useState } from "react";

/**
 * A date range picker that combines two date inputs (start / end) with an
 * inline range calendar. The calendar and inputs stay in sync.
 *
 * This is a controlled component — the parent form passes values and setters.
 */
interface DateRangeCalendarFieldProps {
	startValue: string | undefined;
	endValue: string | undefined;
	onStartChange: (isoDate: string) => void;
	onEndChange: (isoDate: string) => void;
	startLabel?: string;
	endLabel?: string;
}

export function DateRangeCalendarField({
	startValue,
	endValue,
	onStartChange,
	onEndChange,
	startLabel = "Start date",
	endLabel = "End date",
}: DateRangeCalendarFieldProps) {
	const startDate = startValue ? new Date(startValue) : undefined;
	const endDate = endValue ? new Date(endValue) : undefined;

	const [month, setMonth] = useState(() => startDate ?? endDate ?? new Date());

	const startInputValue = startDate ? datetime.format(startDate, "yyyy-MM-dd") : "";
	const endInputValue = endDate ? datetime.format(endDate, "yyyy-MM-dd") : "";

	const handleStartInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value) {
			const date = new Date(value);
			onStartChange(date.toISOString());
			setMonth(date);
		} else {
			onStartChange("");
		}
	};

	const handleEndInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (value) {
			onEndChange(new Date(value).toISOString());
		} else {
			onEndChange("");
		}
	};

	const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
		if (!range) return;
		if (range.from) {
			onStartChange(range.from.toISOString());
		}
		if (range.to) {
			onEndChange(range.to.toISOString());
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="grid grid-cols-2 gap-4">
				<Field orientation="vertical" className="gap-2">
					<FieldLabel>{startLabel}</FieldLabel>
					<div className="relative">
						<Input
							type="date"
							value={startInputValue}
							onChange={handleStartInputChange}
							className="ps-6"
							min="1970-01-01"
						/>
						<div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3">
							<CalendarIcon className="size-4" aria-hidden="true" />
						</div>
					</div>
				</Field>
				<Field orientation="vertical" className="gap-2">
					<FieldLabel>{endLabel}</FieldLabel>
					<div className="relative">
						<Input
							type="date"
							value={endInputValue}
							onChange={handleEndInputChange}
							className="ps-6"
							min="1970-01-01"
						/>
						<div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3">
							<CalendarIcon className="size-4" aria-hidden="true" />
						</div>
					</div>
				</Field>
			</div>

			<div className="flex items-center justify-center">
				<Calendar
					mode="range"
					className="min-h-[300px] [--cell-size:--spacing(10)]"
					selected={{ from: startDate, to: endDate }}
					onSelect={handleRangeSelect}
					month={month}
					onMonthChange={setMonth}
					numberOfMonths={1}
				/>
			</div>
		</div>
	);
}
