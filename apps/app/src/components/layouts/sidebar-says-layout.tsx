import { AppLogo } from "#app/components/layouts/app-logo.tsx";
import { NavUser } from "#app/components/layouts/nav-user.tsx";
import { NavWorkspace } from "#app/components/layouts/nav-workspace.tsx";
import { WorkspaceSwitcher } from "#app/components/layouts/workspace-switcher.tsx";
import { listWorkspacesOptions } from "#app/services/query-options.ts";
import { GithubIcon, TwitterXIcon } from "@hoalu/icons/social";
import { Button } from "@hoalu/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuItem,
	SidebarProvider,
} from "@hoalu/ui/sidebar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { NavWorkspaceList } from "./nav-workspace-list";

/**
 * A layout where the sidebar is on the left and content is on the right.
 *
 * @see https://web.dev/patterns/layout/sidebar-says
 */
export function SidebarSaysLayout({ children }: { children: React.ReactNode }) {
	const params = useParams({ strict: false });
	const hasSlug = !!params.slug;

	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());
	const currentWorkspace = workspaces.find((ws) => ws.slug === params.slug);

	return (
		<SidebarProvider>
			<Sidebar>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							{hasSlug && currentWorkspace ? (
								<WorkspaceSwitcher selectedWorkspace={currentWorkspace} />
							) : (
								<AppLogo />
							)}
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent className="gap-0">
					{hasSlug && <NavWorkspace />}
					{!hasSlug && <NavWorkspaceList />}
				</SidebarContent>
				<SidebarFooter className="gap-0 p-0">
					<div className="flex items-center gap-2.5 border-t p-0">
						<NavUser />
					</div>
					<div className="flex items-center gap-2.5 border-t px-4 py-2">
						<p className="text-muted-foreground font-mono text-xs leading-none tracking-tight">
							v{import.meta.env.PUBLIC_APP_VERSION}
						</p>
						<Button
							variant="link"
							size="icon-sm"
							className="size-4 [&_svg:not([class*='size-'])]:size-3"
							render={
								<a href="https://github.com/quanphm/hoalu" target="_blank" rel="noreferrer">
									<GithubIcon />
								</a>
							}
						/>
						<Button
							variant="link"
							size="icon-sm"
							className="size-4 [&_svg:not([class*='size-'])]:size-3"
							render={
								<a href="https://x.com/quanphmm" target="_blank" rel="noreferrer">
									<TwitterXIcon />
								</a>
							}
						/>
					</div>
				</SidebarFooter>
			</Sidebar>
			<SidebarInset className="scrollbar-thin overflow-auto">{children}</SidebarInset>
		</SidebarProvider>
	);
}
