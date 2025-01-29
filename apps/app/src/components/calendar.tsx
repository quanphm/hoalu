import { Calendar as UICalendar } from "@hoalu/ui/calendar";

export function Calendar() {
	return (
		<div>
			<UICalendar
				mode="single"
				className="pb-2"
				classNames={{
					today: "*:after:bg-red-600",
				}}
			/>
		</div>
	);
}
