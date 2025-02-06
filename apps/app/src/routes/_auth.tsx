import { SuperCenteredLayout } from "@/components/layouts/super-centered-layout";
import { sessionOptions } from "@/services/query-options";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { type } from "arktype";

const searchSchema = type({
	redirect: "string = '/'",
});

export const Route = createFileRoute("/_auth")({
	validateSearch: searchSchema,
	beforeLoad: async ({ context: { queryClient }, search }) => {
		const auth = await queryClient.ensureQueryData(sessionOptions());
		if (auth?.user) {
			throw redirect({ to: search.redirect });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<SuperCenteredLayout>
			<Outlet />
		</SuperCenteredLayout>
	);
}
