import { commandPaletteOpenAtom } from "#app/atoms/index.ts";
import { HotKey } from "#app/components/hotkey.tsx";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { SearchIcon } from "@hoalu/icons/lucide";
import {
	ArrowsExchangeIcon,
	CalendarIcon,
	FileIcon,
	LayoutDashboardIcon,
	TentIcon,
	TrendingUpIcon,
	TriangleSquareCircleIcon,
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
import { Link, useParams } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

export function NavWorkspace() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const setCommandPaletteOpen = useSetAtom(commandPaletteOpenAtom);

	return (
		<>
			<SidebarGroup>
				<SidebarGroupContent>
					<Button
						variant="outline"
						className="mt-2 w-full justify-start gap-2"
						onClick={() => setCommandPaletteOpen(true)}
					>
						<SearchIcon className="size-4" />
						<span className="flex-1 text-left">Search...</span>
						<HotKey {...KEYBOARD_SHORTCUTS.command_palette} />
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
									to="/$slug/incomes"
									params={{ slug }}
									disabled={!KEYBOARD_SHORTCUTS.goto_incomes.enabled}
								/>
							}
							tooltip="Income"
						>
							<TrendingUpIcon />
							<span>Income</span>
							<SidebarMenuBadge>
								<HotKey {...KEYBOARD_SHORTCUTS.goto_incomes} />
							</SidebarMenuBadge>
						</SidebarMenuButton>
					</SidebarMenuItem>

					<SidebarMenuItem>
						<SidebarMenuButton
							render={<Link to="/$slug/recurring-bills" params={{ slug }} />}
							tooltip="Recurring Bills"
						>
							<CalendarIcon />
								<span>Recurring Bills</span>
								<SidebarMenuBadge>
									<HotKey {...KEYBOARD_SHORTCUTS.goto_recurring_bills} />
								</SidebarMenuBadge>
							</SidebarMenuButton>
						</SidebarMenuItem>

						{/* <SidebarMenuItem>
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
						</SidebarMenuItem> */}

						<SidebarMenuItem>
							<SidebarMenuButton
								render={
									<Link to="/$slug/library" params={{ slug }} search={{ tab: "categories" }} />
								}
							>
								<TriangleSquareCircleIcon />
								<span>Library</span>
								<SidebarMenuBadge>
									<HotKey {...KEYBOARD_SHORTCUTS.goto_categories} />
								</SidebarMenuBadge>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton render={<Link to="/$slug/files" params={{ slug }} />}>
								<FileIcon />
								<span>Files</span>
								<SidebarMenuBadge>
									<HotKey {...KEYBOARD_SHORTCUTS.goto_files} />
								</SidebarMenuBadge>
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
