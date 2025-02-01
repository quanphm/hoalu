import { Calendar } from "@/components/calendar";
import { AppLogo } from "@/components/layouts/app-logo";
import { NavUser } from "@/components/layouts/nav-user";
import { NavWorkspace } from "@/components/layouts/nav-workspace";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { listWorkspacesOptions } from "@/services/query-options";
import { DiscordIcon, GithubIcon, TwitterXIcon } from "@hoalu/icons/social";
import { SidebarFooter, SidebarInset, SidebarMenu, SidebarProvider } from "@hoalu/ui/sidebar";
import { Sidebar, SidebarContent, SidebarHeader } from "@hoalu/ui/sidebar";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { NavDocumentation } from "./nav-documentation";
import { NavWorkspaceList } from "./nav-workspace-list";

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
					{!hasSlug && <NavWorkspaceList />}
					<NavDocumentation />
				</SidebarContent>
				<SidebarFooter>
					<SidebarMenu>
						<NavUser />
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset className="max-w-[calc(100%-30rem)] flex-1 overflow-y-auto overflow-x-hidden border md:peer-data-[variant=inset]:shadow-none">
				{children}
			</SidebarInset>

			<Sidebar
				variant="inset"
				collapsible="none"
				className="fixed inset-y-0 right-0 flex h-svh w-[16rem] gap-2 p-2"
			>
				<SidebarContent className="p-2">
					<Calendar />
				</SidebarContent>
				<SidebarFooter>
					<div className="flex flex-col items-center justify-between gap-3">
						<div className="flex items-center justify-center gap-4">
							<a href="https://github.com/quanphm/hoalu" target="_blank" rel="noreferrer">
								<GithubIcon className="size-4" />
							</a>
							<a href="https://github.com/quanphm/hoalu" target="_blank" rel="noreferrer">
								<DiscordIcon className="size-4" />
							</a>
							<a href="https://x.com/quan_phmn" target="_blank" rel="noreferrer">
								<TwitterXIcon className="size-4" />
							</a>
						</div>
						<p className="text-muted-foreground text-xs tracking-tight">Version 0.3.0</p>
					</div>
				</SidebarFooter>
			</Sidebar>
		</SidebarProvider>
	);
}
