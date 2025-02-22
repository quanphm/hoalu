import { DefaultCatchBoundary } from "@/components/default-catch-boundary";
import { LocalPostgresProvider } from "@/components/local-postgres-provider";
import { NotFound } from "@/components/not-found";
import { UiProviders } from "@/components/ui-providers";
import { verifyEnv } from "@/lib/env";
import { queryClient } from "@/lib/query-client";
import { DokiClientProvider } from "@hoalu/doki";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { routeTree } from "./routeTree.gen";

verifyEnv();

const router = createTanStackRouter({
	routeTree,
	context: {
		queryClient,
	},
	scrollRestoration: true,
	defaultPreload: "intent",
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

const container = document.getElementById("root");
const root = createRoot(container as HTMLElement);

function App() {
	return (
		<UiProviders>
			<LocalPostgresProvider>
				<QueryClientProvider client={queryClient}>
					<DokiClientProvider baseUrl={`${import.meta.env.PUBLIC_API_URL}/sync`}>
						<RouterProvider router={router} />
					</DokiClientProvider>
				</QueryClientProvider>
			</LocalPostgresProvider>
		</UiProviders>
	);
}

root.render(<App />);
