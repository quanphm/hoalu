import { Calendar } from "@/components/calendar";
import { AppLogo } from "@/components/layouts/app-logo";
import { NavAccount } from "@/components/layouts/nav-account";
import { NavUser } from "@/components/layouts/nav-user";
import { NavWorkspace } from "@/components/layouts/nav-workspace";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { listWorkspacesOptions } from "@/lib/query-options";
import { SidebarFooter, SidebarInset, SidebarMenu, SidebarProvider } from "@hoalu/ui/sidebar";
import { Sidebar, SidebarContent, SidebarHeader } from "@hoalu/ui/sidebar";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useTheme } from "next-themes";

/**
 * A layout where the sidebar is on the left and content is on the right.
 *
 * @see https://web.dev/patterns/layout/sidebar-says
 */
export function SidebarSaysLayout({ children }: { children: React.ReactNode }) {
	const { theme } = useTheme();

	const params = useParams({ strict: false });
	const hasSlug = !!params.slug;

	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());
	const currentWorkspace = workspaces.find((ws) => ws.slug === params.slug);

	return (
		<SidebarProvider className={cn(theme)}>
			<Sidebar variant="inset">
				<SidebarHeader>
					{hasSlug && currentWorkspace ? (
						<WorkspaceSwitcher currentWorkspace={currentWorkspace} />
					) : (
						<AppLogo />
					)}
				</SidebarHeader>
				<SidebarContent>
					{hasSlug && <NavWorkspace />}
					<NavAccount />
				</SidebarContent>
			</Sidebar>

			<SidebarInset className="max-w-[calc(100%-30rem)] flex-1 overflow-y-auto overflow-x-hidden border md:peer-data-[variant=inset]:shadow-none">
				{children}
			</SidebarInset>

			<Sidebar
				variant="inset"
				collapsible="none"
				className="fixed inset-y-0 right-0 flex h-svh w-[16rem] gap-2 p-2"
			>
				<SidebarHeader>
					<NavUser />
				</SidebarHeader>
				<SidebarContent />
				<SidebarFooter>
					<SidebarMenu>
						<Calendar />
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>
		</SidebarProvider>
	);
}
