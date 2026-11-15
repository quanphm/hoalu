import { toLocalISOString } from "@hoalu/datetime/datetime";
import { CalendarBlankIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import { Calendar } from "@hoalu/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@hoalu/ui/popover";
import { useState } from "react";

import { formatDate } from "#app/helpers/format-date.ts";

import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props {
	label?: React.ReactNode;
	description?: React.ReactNode;
}

export function DatepickerInputField(props: Props) {
	const field = useFieldContext<string | undefined>();
	const [open, setOpen] = useState(false);
	const selected = field.state.value ? new Date(field.state.value) : undefined;

	const handleSelect = (date: Date | undefined) => {
		if (!date) return;
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		field.setValue(toLocalISOString(`${y}-${m}-${d}`));
		setOpen(false);
	};

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<Popover open={open} onOpenChange={setOpen}>
				<FieldControl>
					<PopoverTrigger
						render={
							<Button
								variant="outline"
								className="aria-invalid:border-destructive h-8.5 w-full justify-start gap-2 px-[calc(--spacing(2.5)-1px)] font-normal tabular-nums sm:h-7"
							/>
						}
					>
						<CalendarBlankIcon className="text-muted-foreground size-4" aria-hidden="true" />
						<span className={selected ? "truncate" : "text-muted-foreground truncate"}>
							{selected ? formatDate(selected) : "Select a date"}
						</span>
					</PopoverTrigger>
				</FieldControl>
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
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
