import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

export function Greeting() {
	const { user } = useAuth();

	// 0 -> 23
	const currentHour = new Date().getHours();
	const icon = currentHour < 12 ? "🌤️" : currentHour < 17 ? "⛅" : "🌙";
	const message =
		currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

	const today = Date.now();

	return (
		<div className="space-y-2">
			<p className="font-semibold text-xl leading-none">
				{message}, {user?.name}
			</p>
			<p className="text-base text-muted-foreground tracking-wide">
				{icon} {format(today, "EEEE, MMM d kk:mm")}
			</p>
		</div>
	);
}
