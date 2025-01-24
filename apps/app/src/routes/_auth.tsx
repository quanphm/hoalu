import { SuperCenteredLayout } from "@/components/layouts/super-centered-layout";
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
		<SuperCenteredLayout>
			<Outlet />
		</SuperCenteredLayout>
	);
}
