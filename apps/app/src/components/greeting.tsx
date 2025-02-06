import { useAuth } from "@/hooks/useAuth";

export function Greeting() {
	const { user } = useAuth();

	// 0 -> 23
	const currentHour = new Date().getHours();
	const icon = currentHour < 12 ? "☀" : currentHour < 17 ? "⛅" : "🌙";
	const message =
		currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

	return (
		<p className="font-semibold text-2xl leading-none">
			{icon} {message}, {user?.name}
		</p>
	);
}
