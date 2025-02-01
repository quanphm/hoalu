import {
	GalleryVerticalIcon,
	LandmarkIcon,
	ListTodoIcon,
	SettingsIcon,
	UsersIcon,
} from "@hoalu/icons/lucide";
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
					<SidebarMenuButton asChild tooltip="Overview">
						<Link from="/$slug/" to=".">
							<GalleryVerticalIcon />
							<span>Dashboard</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Finance">
						<Link from="/$slug/" to="./finance">
							<LandmarkIcon />
							<span>Finance</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Tasks">
						<Link from="/$slug/" to="./tasks">
							<ListTodoIcon />
							<span>Tasks</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Settings">
						<Link from="/$slug/" to="./members">
							<UsersIcon />
							<span>Members</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Settings">
						<Link from="/$slug/" to="./settings">
							<SettingsIcon />
							<span>Settings</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
