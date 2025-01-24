import { useAuth } from "@/hooks/useAuth";

export function User() {
	const { user } = useAuth();

	return (
		<div>
			<pre>{JSON.stringify(user, null, 2)}</pre>
		</div>
	);
}
