import { SingleColumn } from "@/components/layout/single-column";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
	beforeLoad: ({ context: { user } }) => {
		if (user) {
			throw redirect({ to: "/" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<SingleColumn>
			<Outlet />
		</SingleColumn>
	);
}
