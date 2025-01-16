import { authClient } from "@/lib/auth-client";
import { useRouteContext } from "@tanstack/react-router";

export function useAuth() {
	const context = useRouteContext({ from: "__root__" });

	return {
		user: context.user,
		session: context.session,
		authClient,
	};
}
