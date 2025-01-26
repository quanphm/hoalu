import { AppLogo } from "@/components/layouts/app-logo";
import { NavAccount } from "@/components/layouts/nav-account";
import { NavWorkspace } from "@/components/layouts/nav-workspace";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { Sidebar, SidebarContent, SidebarHeader } from "@hoalu/ui/sidebar";
import { useParams } from "@tanstack/react-router";

export function AppSidebarLeft() {
	const params = useParams({ strict: false });
	const hasSlug = !!params.slug;

	return (
		<Sidebar variant="inset">
			<SidebarHeader>{hasSlug ? <WorkspaceSwitcher /> : <AppLogo />}</SidebarHeader>
			<SidebarContent>
				{hasSlug && <NavWorkspace />}
				<NavAccount />
			</SidebarContent>
		</Sidebar>
	);
}
