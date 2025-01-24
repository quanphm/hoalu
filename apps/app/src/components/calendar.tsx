import { Calendar as UICalendar } from "@hoalu/ui/calendar";
import { addDays } from "date-fns";
import { useState } from "react";

export function Calendar() {
	const today = new Date();
	const selectedDay = addDays(today, -28);
	const [month, setMonth] = useState(selectedDay);
	const [date, setDate] = useState<Date | undefined>(selectedDay);

	return (
		<div className="rounded-lg border border-border p-2">
			<UICalendar
				mode="single"
				selected={date}
				onSelect={setDate}
				month={month}
				onMonthChange={setMonth}
			/>
		</div>
	);
}
