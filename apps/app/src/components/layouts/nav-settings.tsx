import { HotKey } from "@/components/hotkey";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { BuildingIcon, LibraryBigIcon, UsersIcon } from "@hoalu/icons/lucide";
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
						<Link from="/$slug/" to="./settings/workspace">
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
						<Link from="/$slug/" to="./settings/members">
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
						<Link from="/$slug/" to="./settings/library">
							<LibraryBigIcon />
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
