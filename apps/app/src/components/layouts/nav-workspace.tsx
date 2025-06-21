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
import { Link, useParams } from "@tanstack/react-router";

export function NavWorkspace() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	return (
		<SidebarGroup id="nav-workspace">
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Dashboard">
						<Link to="/$slug" params={{ slug }} activeOptions={{ exact: true }}>
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
							to="/$slug/expenses"
							params={{ slug }}
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
						<Link
							to="/$slug/tasks"
							params={{ slug }}
							disabled={!KEYBOARD_SHORTCUTS.goto_tasks.enabled}
						>
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
							to="/$slug/settings"
							params={{ slug }}
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
