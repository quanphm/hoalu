import { toLocalISOString } from "@hoalu/datetime/datetime";
import { CalendarBlankIcon } from "@hoalu/icons/phosphor";
import { Calendar } from "@hoalu/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";
import { cn } from "@hoalu/ui/utils";
import { useState } from "react";

import { formatDateNear } from "#app/helpers/format-date.ts";

import { useFieldContext } from "./context";
import { pillClass } from "./pill";

function relativeDateLabel(value: string | undefined) {
	if (!value) return "Today";

	const date = new Date(value);
	const today = new Date();
	const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
	const diffDays = Math.round((startOfDay(date) - startOfDay(today)) / 86_400_000);

	if (diffDays === 0) return "Today";
	if (diffDays === -1) return "Yesterday";
	if (diffDays === 1) return "Tomorrow";
	return formatDateNear(date);
}

/**
 * A date needs no list, so it keeps a chip + calendar rather than joining the pill pickers.
 * `relative` speaks the entry form's language ("Today"); a due date that recurs every year is
 * a calendar date, so pass `relative={false}` there.
 */
export function DateChipField(props: { relative?: boolean }) {
	const field = useFieldContext<string | undefined>();
	const [open, setOpen] = useState(false);
	const selected = field.state.value ? new Date(field.state.value) : undefined;
	const isRelative = props.relative ?? true;
	const label =
		isRelative || !field.state.value
			? relativeDateLabel(field.state.value)
			: formatDateNear(selected ?? new Date());
	const hasValue = Boolean(field.state.value);

	const handleSelect = (date: Date | undefined) => {
		if (!date) return;
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		field.setValue(toLocalISOString(`${y}-${m}-${d}`));
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<button
						type="button"
						aria-label={`Date: ${label}`}
						className={cn(
							pillClass.base,
							hasValue ? pillClass.active : pillClass.idle,
							"tabular-nums",
						)}
					>
						<CalendarBlankIcon className="size-3.5" aria-hidden="true" />
						{label}
					</button>
				}
			/>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					captionLayout="dropdown"
					selected={selected}
					defaultMonth={selected}
					onSelect={handleSelect}
					autoFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
