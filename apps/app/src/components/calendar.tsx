import { Calendar as UICalendar } from "@hoalu/ui/calendar";
// import { addDays } from "date-fns";

export function Calendar() {
	return (
		<div>
			<UICalendar
				mode="single"
				classNames={{
					today: "rounded-full bg-red-600 *:after:content-none",
				}}
			/>
		</div>
	);
}
