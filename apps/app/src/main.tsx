import { DefaultCatchBoundary } from "@/components/layouts/default-catch-boundary";
import { NotFound } from "@/components/not-found";
import { LocalPostgresProvider } from "@/components/providers/local-postgres-provider";
import { UiProvider } from "@/components/providers/ui-provider";
import { verifyEnv } from "@/lib/env";
import { queryClient } from "@/lib/query-client";
import { DokiClientProvider } from "@hoalu/doki";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { RouterProvider } from "@tanstack/react-router";
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
		<UiProvider>
			<LocalPostgresProvider>
				<QueryClientProvider client={queryClient}>
					<DokiClientProvider baseUrl={`${import.meta.env.PUBLIC_API_URL}/sync`}>
						<RouterProvider router={router} />
					</DokiClientProvider>
				</QueryClientProvider>
			</LocalPostgresProvider>
		</UiProvider>
	);
}

if (!rootElement?.innerHTML) {
	const root = createRoot(rootElement as HTMLElement);
	root.render(<App />);
}
