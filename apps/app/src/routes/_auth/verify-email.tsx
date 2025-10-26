import { createFileRoute, type ErrorComponentProps, Link, redirect } from "@tanstack/react-router";
import * as z from "zod";

import { Button } from "@hoalu/ui/button";

import { ContentCard, ErrorCard } from "#app/components/cards.tsx";
import { authClient } from "#app/lib/auth-client.ts";

const searchSchema = z.object({
	token: z.string().min(1),
});

export const Route = createFileRoute("/_auth/verify-email")({
	validateSearch: searchSchema,
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
				<Button variant="outline" className="mx-auto w-fit" render={<Link to="/" />}>
					Go to Home
				</Button>
			}
		/>
	);
}
