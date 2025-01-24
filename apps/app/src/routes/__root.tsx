import { DefaultCatchBoundary } from "@/components/default-catch-boundary";
import { NotFound } from "@/components/not-found";
import { ThemeProvider } from "@/components/theme-prodiver";
import type { AuthClient } from "@/lib/auth-client";
import { Toaster } from "@hoalu/ui/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { type ErrorComponentProps, createRootRouteWithContext } from "@tanstack/react-router";
import { Outlet, ScrollRestoration } from "@tanstack/react-router";
import { lazy } from "react";

export const Route = createRootRouteWithContext<{
	authClient: AuthClient;
	queryClient: QueryClient;
}>()({
	beforeLoad: async ({ context }) => {
		const { data } = await context.authClient.getSession();
		return {
			user: data?.user,
			session: data?.session,
		};
	},
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
		<>
			<ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
				{children}
				<Toaster />
			</ThemeProvider>

			<ScrollRestoration />
			<QueryDevtools buttonPosition="top-right" />
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
