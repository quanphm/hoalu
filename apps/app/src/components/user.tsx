import { authClient } from "@/lib/auth-client";

export function User() {
	const { data, isPending } = authClient.useSession();
	console.log(isPending);

	if (isPending || !data) return null;

	return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
