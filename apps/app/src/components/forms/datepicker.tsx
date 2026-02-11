import { Calendar } from "@hoalu/ui/calendar";
import { useState } from "react";

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

	const handleSelect = (date: Date | undefined) => {
		if (!date) {
			field.setValue(new Date().toISOString());
		} else {
			field.setValue(date.toISOString());
		}
	};

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<div className="flex items-center justify-center rounded-md border">
				<Calendar
					mode="single"
					className="min-h-[300px] [--cell-size:--spacing(10)]"
					selected={selected}
					onSelect={handleSelect}
					month={month}
					onMonthChange={setMonth}
				/>
			</div>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
