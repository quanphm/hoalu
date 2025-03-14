import { Calendar } from "@hoalu/ui/calendar";
import { useState } from "react";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props {
	label?: React.ReactNode;
	description?: React.ReactNode;
}

export function DatepickerField(props: Props) {
	const field = useFieldContext<string | undefined>();
	const selected = field.state.value ? new Date(field.state.value) : new Date();
	const [month, setMonth] = useState(selected);

	const handleDayPickerSelect = (date: Date | undefined) => {
		console.log("test");
		if (!date) {
			field.setValue(new Date().toISOString());
		} else {
			field.setValue(date.toISOString());
			setMonth(date);
		}
	};

	return (
		<Field>
			{props.label && <FieldLabel>{props.label}</FieldLabel>}
			<div className="rounded-md border">
				<FieldControl>
					<Calendar
						mode="single"
						className="min-h-[300px] w-full p-2"
						selected={selected}
						onSelect={handleDayPickerSelect}
						month={month}
						onMonthChange={setMonth}
					/>
				</FieldControl>
			</div>
			{props.description && <FieldDescription>{props.description}</FieldDescription>}
			<FieldMessage />
		</Field>
	);
}
