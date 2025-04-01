import { HotKey } from "@/components/hotkey";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { BuildingIcon, LibraryIcon, UsersIcon } from "@hoalu/icons/lucide";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@hoalu/ui/sidebar";
import { Link } from "@tanstack/react-router";

export function NavSettings() {
	return (
		<SidebarGroup id="nav-settings">
			<SidebarGroupLabel>Settings</SidebarGroupLabel>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton asChild>
						<Link
							from="/$slug/"
							to="./settings/workspace"
							disabled={!KEYBOARD_SHORTCUTS.goto_workspace.enabled}
						>
							<BuildingIcon />
							<span>Workspace</span>
							<SidebarMenuBadge>
								<HotKey {...KEYBOARD_SHORTCUTS.goto_workspace} />
							</SidebarMenuBadge>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild>
						<Link from="/$slug/" to="./settings/members" disabled={false}>
							<UsersIcon />
							<span>Members</span>
							<SidebarMenuBadge>
								<HotKey {...KEYBOARD_SHORTCUTS.goto_members} />
							</SidebarMenuBadge>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild>
						<Link
							from="/$slug/"
							to="./settings/library"
							disabled={!KEYBOARD_SHORTCUTS.goto_library.enabled}
						>
							<LibraryIcon />
							<span>Library</span>
							<SidebarMenuBadge>
								<HotKey {...KEYBOARD_SHORTCUTS.goto_library} />
							</SidebarMenuBadge>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
