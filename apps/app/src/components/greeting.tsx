import { useEffect, useState } from "react";

import { datetime, TIME_IN_MILLISECONDS } from "@hoalu/common/datetime";
import {
	ClearDayIcon,
	PartlyCloudyDayIcon,
	PartlyCloudyNightIcon,
	StarryNightIcon,
} from "@hoalu/icons/meteocons";
import { useAuth } from "@/hooks/use-auth";

export function Greeting() {
	const { user } = useAuth();
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const id = setInterval(() => {
			setCurrentTime(new Date());
		}, TIME_IN_MILLISECONDS.MINUTE);
		return () => {
			clearInterval(id);
		};
	}, []);

	// 0 -> 23
	const currentHours = currentTime.getHours();

	const icon =
		currentHours > 4 && currentHours < 12 ? (
			<ClearDayIcon className="inline size-8" />
		) : currentHours < 18 ? (
			<PartlyCloudyDayIcon className="inline size-8" />
		) : currentHours < 21 ? (
			<PartlyCloudyNightIcon className="inline size-8" />
		) : (
			<StarryNightIcon className="inline size-8" />
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
			<p className="text-base text-muted-foreground tracking-wide">
				{icon} {datetime.format(today, "EEEE, MMM d HH:mm")}
			</p>
		</div>
	);
}
