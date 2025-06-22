import { createFileRoute, type ErrorComponentProps, Link, redirect } from "@tanstack/react-router";
import { type } from "arktype";

import { Button } from "@hoalu/ui/button";
import { ContentCard, ErrorCard } from "@/components/cards";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/verify-email")({
	validateSearch: type({
		token: "string > 0",
	}),
	loaderDeps: ({ search: { token } }) => ({ token }),
	loader: async ({ deps: { token } }) => {
		const { data, error } = await authClient.verifyEmail({
			query: { token },
		});
		if (error) {
			throw new Error(error.code);
		}
		if (!data || data.status === false) {
			throw new Error("Invalid token");
		}
		if (data.status) {
			throw redirect({ to: "/" });
		}
		return data;
	},
	component: RouteComponent,
	errorComponent: ErrorComponent,
});

function RouteComponent() {
	return <ContentCard content={<p className="text-center">Verifying...</p>} />;
}

function ErrorComponent(props: ErrorComponentProps) {
	return (
		<ErrorCard
			error={props.error.message}
			footer={
				<Button variant="outline" className="mx-auto w-fit" asChild>
					<Link to="/">Go to Home</Link>
				</Button>
			}
		/>
	);
}
