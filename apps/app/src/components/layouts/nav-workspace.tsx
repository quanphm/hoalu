import {
	ArrowsLeftRightIcon,
	CalendarStarIcon,
	FileIcon,
	MagnifyingGlassIcon,
	RepeatIcon,
	ShapesIcon,
	SquaresFourIcon,
	TentIcon,
	UsersIcon,
	WalletIcon,
} from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@hoalu/ui/sidebar";
import { Link, useParams } from "@tanstack/react-router";

import { commandPaletteOpen$ } from "#app/atoms/index.ts";
import { HotKey } from "#app/components/hotkey.tsx";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";

export function NavWorkspace() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	return (
		<>
			<SidebarGroup>
				<SidebarGroupContent>
					<Button
						variant="outline"
						className="w-full gap-2 rounded-md"
						onClick={() => commandPaletteOpen$.set(true)}
					>
						<MagnifyingGlassIcon className="text-muted-foreground size-4" />
						<span className="text-muted-foreground flex-1 text-left">Search...</span>
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
								<SquaresFourIcon />
								<span>Dashboard</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>

			<SidebarGroup>
				<SidebarGroupLabel>Finance</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								render={
									<Link
										to="/$slug/transactions"
										params={{ slug }}
										disabled={!KEYBOARD_SHORTCUTS.goto_expenses.enabled}
									/>
								}
								tooltip="Transactions"
							>
								<ArrowsLeftRightIcon />
								<span>Transactions</span>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton
								render={<Link to="/$slug/recurring-bills" params={{ slug }} />}
								tooltip="Recurring Bills"
							>
								<RepeatIcon />
								<span>Recurring Bills</span>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton
								render={<Link to="/$slug/events" params={{ slug }} />}
								tooltip="Events"
							>
								<CalendarStarIcon />
								<span>Events</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>

			<SidebarGroup>
				<SidebarGroupLabel>Resources</SidebarGroupLabel>
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton render={<Link to="/$slug/categories" params={{ slug }} />}>
								<ShapesIcon />
								<span>Categories</span>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton render={<Link to="/$slug/wallets" params={{ slug }} />}>
								<WalletIcon />
								<span>Wallets</span>
							</SidebarMenuButton>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton render={<Link to="/$slug/files" params={{ slug }} />}>
								<FileIcon />
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
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton render={<Link to="/$slug/settings/members" params={{ slug }} />}>
								<UsersIcon />
								<span>Members</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</>
	);
}
