import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter, isRedirect } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { DefaultCatchBoundary } from "./components/default-catch-boundary";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				// With SSR, we usually want to set some default staleTime
				// above 0 to avoid refetching immediately on the client
				staleTime: 60 * 1000,
			},
		},
	});

	const router = createTanStackRouter({
		routeTree,
		context: { queryClient },
		defaultPreload: "intent",
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

	// expose router and query client to window for use outside React (e.g. for Better Auth)
	if (typeof window !== "undefined") {
		window.getRouter = () => router;
		window.getQueryClient = () => queryClient;
	}

	return routerWithQueryClient(router, queryClient);
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}

declare global {
	interface Window {
		getRouter: () => ReturnType<typeof createRouter>;
		getQueryClient: () => QueryClient;
	}
}
