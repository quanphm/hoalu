import { useAuth } from "@/hooks/useAuth";

export function User() {
	const { user } = useAuth();
	return <pre>{JSON.stringify(user, null, 2)}</pre>;
}
