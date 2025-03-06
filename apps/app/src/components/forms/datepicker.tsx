import { Calendar } from "@hoalu/ui/calendar";
import { useState } from "react";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "./components";
import { useFieldContext } from "./context";

interface DatepickerFieldProps {
	label?: React.ReactNode;
	description?: React.ReactNode;
}

export function DatepickerField(props: DatepickerFieldProps) {
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
		<FormItem>
			{props.label && <FormLabel>{props.label}</FormLabel>}
			<div className="rounded-md border">
				<FormControl>
					<Calendar
						mode="single"
						className="min-h-[300px] w-full p-2"
						selected={field.state.value}
						onSelect={handleDayPickerSelect}
						month={month}
						onMonthChange={setMonth}
					/>
				</FormControl>
			</div>
			{props.description && <FormDescription>{props.description}</FormDescription>}
			<FormMessage />
		</FormItem>
	);
}
