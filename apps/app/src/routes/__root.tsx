import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	type ErrorComponentProps,
	Outlet,
} from "@tanstack/react-router";

// devtools
import { DefaultCatchBoundary } from "#app/components/layouts/default-catch-boundary.tsx";
import { ReloadPromptPwa } from "#app/components/reload-prompt-pwa.tsx";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

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
			<TanStackDevtools
				plugins={[
					{
						name: "Query",
						render: <ReactQueryDevtoolsPanel />,
					},
					{
						name: "Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
					formDevtoolsPlugin(),
				]}
			/>
		</>
	);
}
