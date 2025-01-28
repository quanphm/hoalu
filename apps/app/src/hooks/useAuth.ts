import { authClient } from "@/lib/auth-client";

export function useAuth() {
	const { data: session } = authClient.useSession();

	return {
		user: session?.user,
		session: session?.session,
	};
}
