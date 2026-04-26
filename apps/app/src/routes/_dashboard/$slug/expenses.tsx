import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/$slug/expenses")({
	beforeLoad: ({ params }) => {
		throw redirect({ to: "/$slug/transactions", params, replace: true });
	},
});
