import { Settings2Icon } from "@hoalu/icons/lucide";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@hoalu/ui/sidebar";
import { Link } from "@tanstack/react-router";

export function NavAccount() {
	return (
		<SidebarGroup id="nav-account">
			<SidebarGroupLabel>Account</SidebarGroupLabel>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Settings">
						<Link to="/">
							<Settings2Icon />
							<span>Settings</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
