import { GalleryVerticalIcon, ListTodoIcon, UsersIcon } from "@hoalu/icons/lucide";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@hoalu/ui/sidebar";
import { Link } from "@tanstack/react-router";

export function NavWorkspace() {
	return (
		<SidebarGroup id="nav-workspace">
			<SidebarGroupLabel>Workspace</SidebarGroupLabel>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Dashboard">
						<Link from="/$slug/" to=".">
							<GalleryVerticalIcon />
							<span>Overview</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Finance">
						<Link from="/$slug/" to=".">
							<GalleryVerticalIcon />
							<span>Finance</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Planner">
						<Link from="/$slug/" to=".">
							<ListTodoIcon />
							<span>Planner</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Members">
						<Link from="/$slug/" to=".">
							<UsersIcon />
							<span>Members</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
