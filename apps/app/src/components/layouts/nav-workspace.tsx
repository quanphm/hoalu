import { Link, useParams } from "@tanstack/react-router";

import {
	AlignBoxTopCenterIcon,
	ArrowsExchangeIcon,
	FileUploadIcon,
	LayoutDashboardIcon,
	TentIcon,
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
							<SidebarMenuButton
								render={<Link to="/$slug" params={{ slug }} activeOptions={{ exact: true }} />}
								tooltip="Dashboard"
							>
								<LayoutDashboardIcon />
								<span>Dashboard</span>
								<SidebarMenuBadge>
									<HotKey {...KEYBOARD_SHORTCUTS.goto_dashboard} />
								</SidebarMenuBadge>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton
								render={
									<Link
										to="/$slug/expenses"
										params={{ slug }}
										disabled={!KEYBOARD_SHORTCUTS.goto_expenses.enabled}
									/>
								}
								tooltip="Expenses"
							>
								<ArrowsExchangeIcon />
								<span>Expenses</span>
								<SidebarMenuBadge>
									<HotKey {...KEYBOARD_SHORTCUTS.goto_expenses} />
								</SidebarMenuBadge>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton
								render={
									<Link
										to="/$slug/tasks"
										params={{ slug }}
										disabled={!KEYBOARD_SHORTCUTS.goto_tasks.enabled}
									/>
								}
								tooltip="Tasks"
							>
								<AlignBoxTopCenterIcon />
								<span>Tasks</span>
								<SidebarMenuBadge>
									<HotKey {...KEYBOARD_SHORTCUTS.goto_tasks} />
								</SidebarMenuBadge>
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
							<SidebarMenuButton render={<Link to="/$slug/wallets" params={{ slug }} />}>
								<WalletIcon />
								<span>Wallets</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton render={<Link to="/$slug/categories" params={{ slug }} />}>
								<TriangleSquareCircleIcon />
								<span>Categories</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton render={<Link to="/$slug/files" params={{ slug }} />}>
								<FileUploadIcon />
								<span>Files</span>
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
							<SidebarMenuButton render={<Link to="/$slug/settings/workspace" params={{ slug }} />}>
								<TentIcon />
								<span>Workspace</span>
								<SidebarMenuBadge>
									<HotKey {...KEYBOARD_SHORTCUTS.goto_workspace} />
								</SidebarMenuBadge>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton render={<Link to="/$slug/settings/members" params={{ slug }} />}>
								<UsersGroupIcon />
								<span>Members</span>
								<SidebarMenuBadge>
									<HotKey {...KEYBOARD_SHORTCUTS.goto_members} />
								</SidebarMenuBadge>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</>
	);
}
