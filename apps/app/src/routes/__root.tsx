import { DefaultCatchBoundary } from "@/components/default-catch-boundary";
import { UiProviders } from "@/components/ui-providers";
import { Toaster } from "@hoalu/ui/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { type ErrorComponentProps, createRootRouteWithContext } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { lazy } from "react";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	errorComponent: ErrorComponent,
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function ErrorComponent(props: ErrorComponentProps) {
	return (
		<RootDocument>
			<DefaultCatchBoundary {...props} />
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<>
			<UiProviders>
				{children}
				<Toaster />
			</UiProviders>
			<QueryDevtools buttonPosition="bottom-right" />
			<RouterDevtools position="bottom-right" />
		</>
	);
}

const RouterDevtools = import.meta.env.PROD
	? () => null
	: lazy(() =>
			import("@tanstack/router-devtools").then((res) => ({
				default: res.TanStackRouterDevtools,
			})),
		);

const QueryDevtools = import.meta.env.PROD
	? () => null
	: lazy(() =>
			import("@tanstack/react-query-devtools").then((res) => ({
				default: res.ReactQueryDevtools,
			})),
		);
