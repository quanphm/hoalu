import { Link, useParams } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

import {
	AlignBoxTopCenterIcon,
	ArrowsExchangeIcon,
	FileUploadIcon,
	FolderIcon,
	LayoutDashboardIcon,
	TentIcon,
	UsersGroupIcon,
} from "@hoalu/icons/tabler";
import { Button } from "@hoalu/ui/button";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@hoalu/ui/sidebar";

import { createExpenseDialogAtom } from "#app/atoms/dialogs.ts";
import { HotKey } from "#app/components/hotkey.tsx";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";

export function NavWorkspace() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const setCreateExpenseDialog = useSetAtom(createExpenseDialogAtom);

	return (
		<>
			<SidebarGroup>
				<SidebarGroupContent>
					<Button
						variant="default"
						className="w-full justify-center"
						onClick={() => setCreateExpenseDialog({ state: true })}
					>
						Create expense
					</Button>
				</SidebarGroupContent>
			</SidebarGroup>

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

						<SidebarMenuItem>
							<SidebarMenuButton render={<Link to="/$slug/library" params={{ slug }} />}>
								<FolderIcon />
								<span>Library</span>
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
