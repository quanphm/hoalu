import { useEffect, useState } from "react";

import { datetime, TIME_IN_MILLISECONDS } from "@hoalu/common/datetime";
import {
	ClearDayIcon,
	PartlyCloudyDayIcon,
	PartlyCloudyNightIcon,
	StarryNightIcon,
} from "@hoalu/icons/meteocons";

import { useAuth } from "#app/hooks/use-auth.ts";

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
			<ClearDayIcon className="-ml-2 inline size-10" />
		) : currentHours < 18 ? (
			<PartlyCloudyDayIcon className="-ml-2 inline size-10" />
		) : currentHours < 21 ? (
			<PartlyCloudyNightIcon className="-ml-2 inline size-10" />
		) : (
			<StarryNightIcon className="-ml-2 inline size-10" />
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
			<p className="text-base text-muted-foreground tracking-wide">
				{icon} {datetime.format(today, "EEEE, d MMM HH:mm")}
			</p>
			<p className="font-semibold text-xl leading-none">
				{message}, {user?.name}
			</p>
		</div>
	);
}
