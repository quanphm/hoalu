import { toLocalISOString } from "@hoalu/common/datetime";
import { Calendar } from "@hoalu/ui/calendar";
import { useEffect, useState } from "react";

import { Field, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props {
	label?: React.ReactNode;
	description?: React.ReactNode;
}

export function DatepickerField(props: Props) {
	const field = useFieldContext<string | undefined>();
	const selected = field.state.value ? new Date(field.state.value) : new Date();
	const [month, setMonth] = useState(selected);

	useEffect(() => {
		if (field.state.value) {
			setMonth(new Date(field.state.value));
		}
	}, [field.state.value]);

	const handleSelect = (date: Date | undefined) => {
		if (!date) {
			const today = new Date();
			const y = today.getFullYear();
			const m = String(today.getMonth() + 1).padStart(2, "0");
			const d = String(today.getDate()).padStart(2, "0");
			field.setValue(toLocalISOString(`${y}-${m}-${d}`));
		} else {
			const y = date.getFullYear();
			const m = String(date.getMonth() + 1).padStart(2, "0");
			const d = String(date.getDate()).padStart(2, "0");
			field.setValue(toLocalISOString(`${y}-${m}-${d}`));
			setMonth(date);
		}
	};

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<div className="flex items-center justify-center rounded-md border">
				<Calendar
					mode="single"
					captionLayout="dropdown"
					className="min-h-[300px] [--cell-size:--spacing(10)]"
					selected={selected}
					month={month}
					onMonthChange={setMonth}
					onSelect={handleSelect}
				/>
			</div>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
