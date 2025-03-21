import { useAuth } from "@/hooks/use-auth";
import {
	ClearDayIcon,
	PartlyCloudyDayIcon,
	PartlyCloudyNightIcon,
	StarryNightIcon,
} from "@hoalu/icons/meteocons";
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

	const icon =
		currentHours > 4 && currentHours < 12 ? (
			<ClearDayIcon className="size-8" />
		) : currentHours < 18 ? (
			<PartlyCloudyDayIcon className="size-8" />
		) : currentHours < 21 ? (
			<PartlyCloudyNightIcon className="size-8" />
		) : (
			<StarryNightIcon className="size-8" />
		);

	const message =
		currentHours > 4 && currentHours < 12
			? "Good morning"
			: currentHours < 18
				? "Good afternoon"
				: currentHours < 21
					? "Good evening"
					: "Good night";

	const today = Date.now();

	return (
		<div className="space-y-2">
			<p className="font-semibold text-xl leading-none">
				{message}, {user?.name}
			</p>
			<p className="flex items-center gap-1 text-base text-muted-foreground tracking-wide">
				{icon} {format(today, "EEEE, MMM d kk:mm")}
			</p>
		</div>
	);
}
