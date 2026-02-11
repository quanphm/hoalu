import { DefaultCatchBoundary } from "#app/components/layouts/default-catch-boundary.tsx";
import { NotFound } from "#app/components/not-found.tsx";
import { UiProvider } from "#app/components/providers/ui-provider.tsx";
import { verifyEnv } from "#app/lib/env.ts";
import { queryClient } from "#app/lib/query-client.ts";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanStackRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { routeTree } from "./routeTree.gen";

verifyEnv();

const router = createTanStackRouter({
	routeTree,
	context: {
		queryClient,
	},
	scrollRestoration: true,
	scrollRestorationBehavior: "instant",
	defaultPreload: "render",
	defaultPreloadStaleTime: 0,
	defaultNotFoundComponent: NotFound,
	defaultErrorComponent: DefaultCatchBoundary,
});
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

if (typeof window !== "undefined") {
	window.getRouter = () => router;
}
declare global {
	interface Window {
		getRouter: () => typeof router;
	}
}

const rootElement = document.getElementById("root");

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<UiProvider>
				<RouterProvider router={router} />
			</UiProvider>
		</QueryClientProvider>
	);
}

if (!rootElement?.innerHTML) {
	const root = createRoot(rootElement as HTMLElement);
	root.render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
