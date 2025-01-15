import { DefaultCatchBoundary } from "@/components/default-catch-boundary";
import { authClient } from "@/lib/auth-client";
import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter, isRedirect } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { routeTree } from "./routeTree.gen";

export const queryClient = new QueryClient();

export function createRouter() {
	const router = createTanStackRouter({
		routeTree,
		context: { authClient, queryClient },
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		defaultErrorComponent: DefaultCatchBoundary,
	});

	/**
	 * @see https://github.com/nekochan0122/tanstack-boilerplate/blob/main/src/router.ts#L37
	 */
	queryClient.getQueryCache().config.onError = handleRedirectError;
	queryClient.getMutationCache().config.onError = handleRedirectError;

	function handleRedirectError(error: Error) {
		if (isRedirect(error)) {
			router.navigate(
				router.resolveRedirect({
					...error,
					_fromLocation: router.state.location,
				}),
			);
		}
	}

	return routerWithQueryClient(router, queryClient);
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}
