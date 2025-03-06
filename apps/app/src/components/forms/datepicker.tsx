import { Calendar } from "@hoalu/ui/calendar";
import { Input } from "@hoalu/ui/input";
import { Label } from "@hoalu/ui/label";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useId, useState } from "react";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "./components";
import { useFieldContext } from "./context";

interface DatepickerFieldProps {
	label?: React.ReactNode;
	description?: React.ReactNode;
}

export function DatepickerField(props: DatepickerFieldProps) {
	const id = useId();
	const field = useFieldContext<Date>();
	const today = field.state.value;

	const [month, setMonth] = useState(today);
	const [date, setDate] = useState<Date | undefined>(today);
	const [inputValue, setInputValue] = useState("");

	const handleDayPickerSelect = (date: Date | undefined) => {
		if (!date) {
			setInputValue("");
			setDate(undefined);
		} else {
			setDate(date);
			setMonth(date);
			setInputValue(format(date, "yyyy-MM-dd"));
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setInputValue(value);

		if (value) {
			const parsedDate = new Date(value);
			setDate(parsedDate);
			setMonth(parsedDate);
		} else {
			setDate(undefined);
		}
	};

	return (
		<FormItem>
			{props.label && <FormLabel>{props.label}</FormLabel>}
			<div className="rounded-md border">
				<Calendar
					mode="single"
					className="p-2"
					selected={date}
					onSelect={handleDayPickerSelect}
					month={month}
					onMonthChange={setMonth}
				/>
				<div className="border-t p-3">
					<div className="flex items-center gap-3">
						<Label htmlFor={id} className="text-xs">
							Enter date
						</Label>
						<div className="relative grow">
							<Input
								id={id}
								type="date"
								value={inputValue}
								onChange={handleInputChange}
								className="peer appearance-none ps-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
								aria-label="Select date"
							/>
							<div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
								<CalendarIcon size={16} aria-hidden="true" />
							</div>
						</div>
					</div>
				</div>
			</div>
			{props.description && <FormDescription>{props.description}</FormDescription>}
			<FormMessage />
		</FormItem>
	);
}
