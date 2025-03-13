import { HotKey } from "@/components/hotkey";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { ArrowRightLeftIcon, GalleryVerticalIcon, ListTodoIcon } from "@hoalu/icons/lucide";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuBadge,
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
						<Link from="/$slug/" to="." activeOptions={{ exact: true }}>
							<GalleryVerticalIcon />
							<span>Dashboard</span>
							<SidebarMenuBadge>
								<HotKey>{KEYBOARD_SHORTCUTS.goto_dashboard.label}</HotKey>
							</SidebarMenuBadge>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Tasks">
						<Link from="/$slug/" to="./expenses">
							<ArrowRightLeftIcon />
							<span>Expenses</span>
							<SidebarMenuBadge>
								<HotKey>{KEYBOARD_SHORTCUTS.goto_expenses.label}</HotKey>
							</SidebarMenuBadge>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Tasks">
						<Link from="/$slug/" to="./tasks">
							<ListTodoIcon />
							<span>Tasks</span>
							<SidebarMenuBadge>
								<HotKey>{KEYBOARD_SHORTCUTS.goto_tasks.label}</HotKey>
							</SidebarMenuBadge>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
