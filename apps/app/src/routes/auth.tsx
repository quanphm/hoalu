import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "@woben/ui/sonner";

export const Route = createFileRoute("/auth")({
	beforeLoad: ({ context: { user }, location, preload }) => {
		if (user) {
			if (!preload) {
				toast.info("Already authenticated, Redirecting...");
			}
			throw redirect({ to: "/" });
		}
		if (location.pathname === "/auth" || location.pathname === "/auth/") {
			throw redirect({ to: "/auth/signin" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="flex w-full max-w-sm flex-col gap-6">
				<Outlet />
			</div>
		</div>
	);
}
