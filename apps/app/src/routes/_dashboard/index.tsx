import { SidebarLeft } from "@/components/layout/sidebar-left";
import { User } from "@/components/user";
import { useAuth } from "@/hooks/useAuth";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@woben/ui/breadcrumb";
import { Button } from "@woben/ui/button";
import { Separator } from "@woben/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@woben/ui/sidebar";

export const Route = createFileRoute("/_dashboard/")({
	beforeLoad: ({ context: { user } }) => {
		if (!user) {
			throw redirect({ to: "/login" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const { authClient } = useAuth();

	async function formAction() {
		authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.invalidate();
				},
			},
		});
		router.invalidate();
	}

	return (
		<SidebarProvider>
			<SidebarLeft />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2">
					<div className="flex items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-2 h-4" />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>Data Fetching</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<div className="grid auto-rows-min gap-4 md:grid-cols-3">
						<User />
						<form action={formAction}>
							<Button type="submit">Sign out</Button>
						</form>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
