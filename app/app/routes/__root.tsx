import { NotFound } from "@/components/not-found";
import { seo } from "@/utils/seo";
import { createRootRoute } from "@tanstack/react-router";
import { Outlet, ScrollRestoration } from "@tanstack/react-router";
import { Body, Head, Html, Meta, Scripts } from "@tanstack/start";
import globalCss from "@tssd/ui/global.css?url";
import { lazy } from "react";

const TanStackRouterDevtools = import.meta.env.PROD
	? () => null
	: lazy(() =>
			import("@tanstack/router-devtools").then((res) => ({
				default: res.TanStackRouterDevtools,
			})),
		);

export const Route = createRootRoute({
	meta: () => [
		{
			charSet: "utf-8",
		},
		{
			name: "viewport",
			content: "width=device-width, initial-scale=1",
		},
		...seo({
			title: "Tssd | Tanstack Start with Drizzle",
		}),
	],
	links: () => [
		{
			rel: "stylesheet",
			href: globalCss,
		},
	],
	notFoundComponent: () => <NotFound />,
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<Html>
			<Head>
				<Meta />
			</Head>
			<Body>
				{children}
				<TanStackRouterDevtools position="bottom-right" />
				<ScrollRestoration />
				<Scripts />
			</Body>
		</Html>
	);
}
