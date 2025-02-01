import { useAuth } from "@/hooks/useAuth";

export function Greeting() {
	const { user } = useAuth();

	// 0 -> 23
	const currentHour = new Date().getHours();
	const icon = currentHour < 12 ? "☀️" : currentHour < 17 ? "⛅" : "🌙";
	const message = currentHour < 12 ? "morning" : currentHour < 17 ? "afternoon" : "evening";

	return (
		<p className="font-semibold text-2xl leading-none tracking-tight">
			{icon} Good {message}, {user?.name}
		</p>
	);
}
