import { Calendar } from "@hoalu/ui/calendar";
import { useState } from "react";
import { Field, FieldControl, FieldDescription, FieldLabel, FieldMessage } from "./components";
import { useFieldContext } from "./context";

interface Props {
	label?: React.ReactNode;
	description?: React.ReactNode;
}

export function DatepickerField(props: Props) {
	const field = useFieldContext<Date | undefined>();
	const today = field.state.value;
	const [month, setMonth] = useState(today);

	const handleDayPickerSelect = (date: Date | undefined) => {
		if (!date) {
			field.setValue(undefined);
		} else {
			field.setValue(date);
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
						selected={field.state.value}
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
