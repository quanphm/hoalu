import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	type ErrorComponentProps,
	Outlet,
} from "@tanstack/react-router";
import { lazy } from "react";

import { DefaultCatchBoundary } from "@/components/layouts/default-catch-boundary";
import { ReloadPromptPwa } from "@/components/reload-prompt-pwa";

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
			{children}
			<ReloadPromptPwa />
			<QueryDevtools buttonPosition="top-right" />
			<RouterDevtools position="bottom-right" />
		</>
	);
}

const RouterDevtools = import.meta.env.PROD
	? () => null
	: lazy(() =>
			import("@tanstack/react-router-devtools").then((res) => ({
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
