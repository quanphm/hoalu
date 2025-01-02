import { DefaultCatchBoundary } from "@/components/default-catch-boundary";
import { NotFound } from "@/components/not-found";
import { seo } from "@/utils/seo";
import type { QueryClient } from "@tanstack/react-query";
import { type ErrorComponentProps, createRootRouteWithContext } from "@tanstack/react-router";
import { Outlet, ScrollRestoration } from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import globalCss from "@woben/ui/global.css?url";
import { lazy } from "react";

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

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, maximum-scale=2, user-scalable=1",
			},
			...seo({
				title: "Woben | The Everyday Digital Craftsman's Space",
			}),
		],
		links: [
			{
				rel: "stylesheet",
				href: globalCss,
			},
		],
	}),
	errorComponent: ErrorComponent,
	notFoundComponent: NotFound,
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
		<html>
			<head>
				<Meta />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />

				<QueryDevtools buttonPosition="top-right" />
				<RouterDevtools position="bottom-right" />
			</body>
		</html>
	);
}
