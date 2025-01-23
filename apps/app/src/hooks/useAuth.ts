import { authClient } from "@/lib/auth-client";

export function useAuth() {
	const { data: session } = authClient.useSession();
	const { data: workspace } = authClient.useActiveWorkspace();

	return {
		user: session?.user,
		session: session?.session,
		workspace,
	};
}
