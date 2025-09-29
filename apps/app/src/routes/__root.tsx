import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	type ErrorComponentProps,
	Outlet,
} from "@tanstack/react-router";

import { DefaultCatchBoundary } from "@/components/layouts/default-catch-boundary";
import { ReloadPromptPwa } from "@/components/reload-prompt-pwa";

// devtools
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { FormDevtools } from "@tanstack/react-form-devtools";

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
					{
						name: "Form",
						render: <FormDevtools />,
					},
				]}
			/>
		</>
	);
}
