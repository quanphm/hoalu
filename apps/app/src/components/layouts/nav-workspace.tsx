import { Link, useParams } from "@tanstack/react-router";

import {
	AlignBoxTopCenterIcon,
	ArrowsExchangeIcon,
	BuildingCottageIcon,
	FileUploadIcon,
	LayoutDashboardIcon,
	TriangleSquareCircleIcon,
	UsersGroupIcon,
	WalletIcon,
} from "@hoalu/icons/tabler";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@hoalu/ui/sidebar";
import { HotKey } from "@/components/hotkey";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";

export function NavWorkspace() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	return (
		<>
			<SidebarGroup className="mt-2">
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip="Dashboard">
								<Link to="/$slug" params={{ slug }} activeOptions={{ exact: true }}>
									<LayoutDashboardIcon />
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
									<ArrowsExchangeIcon />
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
									<AlignBoxTopCenterIcon />
									<span>Tasks</span>
									<SidebarMenuBadge>
										<HotKey {...KEYBOARD_SHORTCUTS.goto_tasks} />
									</SidebarMenuBadge>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>

			<SidebarGroup>
				<SidebarGroupLabel>Libraries</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link to="/$slug/wallets" params={{ slug }}>
									<WalletIcon />
									<span>Wallets</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link to="/$slug/categories" params={{ slug }}>
									<TriangleSquareCircleIcon />
									<span>Categories</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link to="/$slug/files" params={{ slug }}>
									<FileUploadIcon />
									<span>Files</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>

			<SidebarGroup>
				<SidebarGroupLabel>Settings</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link to="/$slug/settings/workspace" params={{ slug }}>
									<BuildingCottageIcon />
									<span>Workspace</span>
									<SidebarMenuBadge>
										<HotKey {...KEYBOARD_SHORTCUTS.goto_workspace} />
									</SidebarMenuBadge>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild>
								<Link to="/$slug/settings/members" params={{ slug }}>
									<UsersGroupIcon />
									<span>Members</span>
									<SidebarMenuBadge>
										<HotKey {...KEYBOARD_SHORTCUTS.goto_members} />
									</SidebarMenuBadge>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</>
	);
}
