/// <reference types="vite/client" />
import { DefaultCatchBoundary } from "#app/components/layouts/default-catch-boundary.tsx";
import { NotFound } from "#app/components/not-found.tsx";
import { ReloadPromptPwa } from "#app/components/reload-prompt-pwa.tsx";
import gloabalCss from "#app/styles/global.css?url";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";

// devtools
import TanStackQueryProvider from "#app/components/providers/tanstack-provider.tsx";
import { UiProvider } from "#app/components/providers/ui-provider.tsx";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
			},
			{ name: "theme-color", content: "#242a3a" },
			{ name: "apple-mobile-web-app-title", content: "Hoalu" },
			{ title: "Hoalu" },
		],
		links: [
			{ rel: "stylesheet", href: gloabalCss },
			{ rel: "icon", type: "image/png", href: "/images/favicon-96x96.png", sizes: "96x96" },
			{ rel: "icon", type: "image/svg+xml", href: "/images/favicon.svg" },
			{ rel: "shortcut icon", href: "/images/favicon.ico" },
			{ rel: "apple-touch-icon", sizes: "180x180", href: "/images/apple-touch-icon.png" },
		],
	}),
	errorComponent: DefaultCatchBoundary,
	notFoundComponent: () => <NotFound />,
	shellComponent: RootDocument,
});

function RootDocument({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<TanStackQueryProvider>
					<UiProvider>
						{children}

						<ReloadPromptPwa />
						<TanStackDevtools
							config={{
								position: "bottom-right",
							}}
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
					</UiProvider>
				</TanStackQueryProvider>
				<Scripts />
			</body>
		</html>
	);
}
