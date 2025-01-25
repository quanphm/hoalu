import { authClient } from "@/lib/auth-client";
import { Sidebar, SidebarContent, SidebarHeader } from "@hoalu/ui/sidebar";
import { WorkspaceSwitcher } from "../workspace-switcher";
import { AppLogo } from "./app-logo";
import { NavAccount } from "./nav-account";
import { NavWorkspace } from "./nav-workspace";

export function AppSidebarLeft() {
	const { data: workspace } = authClient.useActiveWorkspace();

	return (
		<Sidebar variant="inset">
			<SidebarHeader>{workspace ? <WorkspaceSwitcher /> : <AppLogo />}</SidebarHeader>
			<SidebarContent>
				<NavWorkspace />
				<NavAccount />
			</SidebarContent>
		</Sidebar>
	);
}
