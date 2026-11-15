import { toLocalISOString } from "@hoalu/datetime/datetime";
import { CalendarBlankIcon } from "@hoalu/icons/phosphor";
import { RangeCalendar } from "@hoalu/ui/calendar-range";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";
import { cn } from "@hoalu/ui/utils";
import { useState } from "react";

import { formatDateNear } from "#app/helpers/format-date.ts";

import { pillClass } from "./pill";

interface DateRangeChipProps {
	start: string | undefined;
	end: string | undefined;
	onChange: (next: { start: string | undefined; end: string | undefined }) => void;
}

function rangeLabel(start: string | undefined, end: string | undefined) {
	if (!start && !end) return "Dates";
	if (start && !end) return `From ${formatDateNear(start)}`;
	if (!start && end) return `Until ${formatDateNear(end)}`;
	if (!start || !end) return "Dates";
	return start === end
		? formatDateNear(start)
		: `${formatDateNear(start)} – ${formatDateNear(end)}`;
}

function isoDay(date: Date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

/**
 * A range is two clicks on the same calendar, so the popover has to survive the first one: the
 * click that starts a range must not be mistaken for the click that finishes it.
 */
export function DateRangeChip({ start, end, onChange }: DateRangeChipProps) {
	const [open, setOpen] = useState(false);
	const hasRange = Boolean(start || end);
	const label = rangeLabel(start, end);

	const handleRangeChange = (range: { from?: Date; to?: Date } | undefined) => {
		if (!range?.from) {
			onChange({ start: undefined, end: undefined });
			return;
		}
		const from = toLocalISOString(isoDay(range.from));
		if (!range.to) {
			onChange({ start: from, end: undefined });
			return;
		}
		onChange({ start: from, end: toLocalISOString(isoDay(range.to)) });
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<button
						type="button"
						aria-label={`Dates: ${label}`}
						className={cn(
							pillClass.base,
							hasRange ? pillClass.active : pillClass.idle,
							"tabular-nums",
						)}
					>
						<CalendarBlankIcon className="size-3.5" aria-hidden="true" />
						{label}
					</button>
				}
			/>
			<PopoverContent className="w-auto p-0" align="start">
				<RangeCalendar
					numberOfMonths={1}
					defaultMonth={start ? new Date(start) : undefined}
					value={{
						from: start ? new Date(start) : undefined,
						to: end ? new Date(end) : undefined,
					}}
					onChange={handleRangeChange}
					autoFocus
				/>
				{hasRange && (
					<div className="border-border flex justify-end border-t px-2 py-1.5">
						<button
							type="button"
							className="text-muted-foreground hover:text-foreground text-xs font-medium"
							onClick={() => {
								onChange({ start: undefined, end: undefined });
								setOpen(false);
							}}
						>
							Clear dates
						</button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
