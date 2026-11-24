import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanStackRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { DefaultCatchBoundary } from "#app/components/layouts/default-catch-boundary.tsx";
import { NotFound } from "#app/components/not-found.tsx";
import { UiProvider } from "#app/components/providers/ui-provider.tsx";
import { initPersistence } from "#app/lib/collections/persistence.ts";
import { verifyEnv } from "#app/lib/env.ts";
import { requestPersistentStorage } from "#app/lib/persistent-storage.ts";
import { queryClient } from "#app/lib/query-client.ts";
import { initQueryPersistence } from "#app/lib/query-persistence.ts";

import { routeTree } from "./routeTree.gen";

verifyEnv();

void requestPersistentStorage();

const router = createTanStackRouter({
	routeTree,
	context: {
		queryClient,
	},
	scrollRestoration: true,
	scrollRestorationBehavior: "instant",
	defaultPreload: "intent",
	/**
	 * Preloading the next screen is only worth anything if the data it fetched survives until the tap.
	 * At `0` every preload is stale by the time you press a nav item, so the loader re-runs and the
	 * screen waits on the network it already paid for.
	 */
	defaultPreloadStaleTime: 30_000,
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

if (rootElement) {
	const root = createRoot(rootElement);

	async function bootstrap() {
		await initPersistence();
		await initQueryPersistence();
		root.render(
			<StrictMode>
				<App />
			</StrictMode>,
		);
	}

	void bootstrap();
}
