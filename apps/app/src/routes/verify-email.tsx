import { SuperCenteredLayout } from "@/components/layouts/super-centered-layout";
import { authClient } from "@/lib/auth-client";
import { Button } from "@hoalu/ui/button";
import { type ErrorComponentProps, Link, createFileRoute, redirect } from "@tanstack/react-router";
import { type } from "arktype";

const searchSchema = type({
	token: "string > 0",
});

export const Route = createFileRoute("/verify-email")({
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
	return (
		<SuperCenteredLayout>
			<p className="text-center">Verifying...</p>
		</SuperCenteredLayout>
	);
}

function ErrorComponent(props: ErrorComponentProps) {
	return (
		<SuperCenteredLayout>
			<p className="text-center">Something went wrong</p>
			{props.error.message && (
				<p className="text-center">
					Cause:{" "}
					<span className="rounded-md border border-destructive/50 bg-destructive/5 p-2 text-destructive text-sm">
						{props.error.message}
					</span>
				</p>
			)}
			<Button className="mx-auto w-fit" asChild>
				<Link to="/">Go to Home</Link>
			</Button>
		</SuperCenteredLayout>
	);
}
