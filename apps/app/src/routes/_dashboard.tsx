import { SidebarLeft } from "@/components/layouts/sidebar-left";
import { SidebarInset, SidebarProvider } from "@hoalu/ui/sidebar";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard")({
	beforeLoad: async ({ context: { user } }) => {
		if (!user) {
			throw redirect({ to: "/login" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<SidebarProvider>
			<SidebarLeft />
			<SidebarInset>
				<main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4">
					{/* <header className="mx-auto max-w-7xl py-4">Title</header> */}
					<div className="mx-auto flex max-w-7xl py-4">
						<div className="mb-4 flex flex-col items-start justify-start">
							<Outlet />
						</div>
					</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
