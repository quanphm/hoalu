import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export function Greeting() {
	const { user } = useAuth();
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const id = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);
		return () => {
			clearInterval(id);
		};
	}, []);

	// 0 -> 23
	const currentHours = currentTime.getHours();
	const icon = currentHours < 4 ? "🥱" : currentHours < 12 ? "🌤" : currentHours < 17 ? "⛅" : "🌙";
	const message =
		currentHours < 4
			? "It's time to sleep"
			: currentHours < 12
				? "Good morning"
				: currentHours < 17
					? "Good afternoon"
					: "Good evening";

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
