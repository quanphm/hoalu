import { Calendar as UICalendar } from "@hoalu/ui/calendar";
// import { addDays } from "date-fns";

export function Calendar() {
	return (
		<div>
			<UICalendar
				mode="single"
				className="pb-4"
				classNames={{
					today: "rounded-lg bg-zinc-600",
				}}
			/>
		</div>
	);
}
