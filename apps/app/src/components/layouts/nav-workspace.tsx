import { HotKey } from "@/components/hotkey";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import {
	ArrowRightLeftIcon,
	GalleryVerticalIcon,
	ListTodoIcon,
	SettingsIcon,
} from "@hoalu/icons/lucide";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@hoalu/ui/sidebar";
import { Link } from "@tanstack/react-router";

export function NavWorkspace() {
	return (
		<SidebarGroup id="nav-workspace">
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Dashboard">
						<Link from="/$slug/" to="." activeOptions={{ exact: true }}>
							<GalleryVerticalIcon />
							<span>Dashboard</span>
							<SidebarMenuBadge>
								<HotKey {...KEYBOARD_SHORTCUTS.goto_dashboard} />
							</SidebarMenuBadge>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Expenses">
						<Link
							from="/$slug/"
							to="./expenses"
							disabled={!KEYBOARD_SHORTCUTS.goto_expenses.enabled}
						>
							<ArrowRightLeftIcon />
							<span>Expenses</span>
							<SidebarMenuBadge>
								<HotKey {...KEYBOARD_SHORTCUTS.goto_expenses} />
							</SidebarMenuBadge>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Tasks">
						<Link from="/$slug/" to="./tasks" disabled={!KEYBOARD_SHORTCUTS.goto_tasks.enabled}>
							<ListTodoIcon />
							<span>Tasks</span>
							<SidebarMenuBadge>
								<HotKey {...KEYBOARD_SHORTCUTS.goto_tasks} />
							</SidebarMenuBadge>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild>
						<Link
							from="/$slug/"
							to="./settings"
							disabled={!KEYBOARD_SHORTCUTS.goto_workspace.enabled}
						>
							<SettingsIcon />
							<span>Settings</span>
							<SidebarMenuBadge>
								<HotKey {...KEYBOARD_SHORTCUTS.goto_workspace} />
							</SidebarMenuBadge>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
