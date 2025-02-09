import { AppLogo } from "@/components/layouts/app-logo";
import { NavUser } from "@/components/layouts/nav-user";
import { NavWorkspace } from "@/components/layouts/nav-workspace";
import { WorkspaceSwitcher } from "@/components/layouts/workspace-switcher";
import { listWorkspacesOptions } from "@/services/query-options";
import { DiscordIcon, GithubIcon, TwitterXIcon } from "@hoalu/icons/social";
import {
	SidebarFooter,
	SidebarInset,
	SidebarMenu,
	SidebarProvider,
	SidebarTrigger,
} from "@hoalu/ui/sidebar";
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
			<Sidebar>
				<SidebarHeader>
					{hasSlug && currentWorkspace ? (
						<WorkspaceSwitcher selectedWorkspace={currentWorkspace} />
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
					{/* <div className="flex justify-center gap-4">
						<a
							href="https://github.com/quanphm/hoalu"
							target="_blank"
							rel="noreferrer"
							className="rounded-full border p-2 hover:bg-muted"
						>
							<GithubIcon className="size-4" />
						</a>
						<a
							href="https://github.com/quanphm/hoalu"
							target="_blank"
							rel="noreferrer"
							className="rounded-full border p-2 hover:bg-muted"
						>
							<DiscordIcon className="size-4" />
						</a>
						<a
							href="https://x.com/quan_phmn"
							target="_blank"
							rel="noreferrer"
							className="rounded-full border p-2 hover:bg-muted"
						>
							<TwitterXIcon className="size-4" />
						</a>
					</div> */}
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
}
