import {
	DotsThreeVerticalIcon,
	KeyIcon,
	SignOutIcon,
	SlidersHorizontalIcon,
} from "@hoalu/icons/phosphor";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@hoalu/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { useId } from "react";

import { UserAvatar } from "#app/components/user-avatar.tsx";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { useAuth } from "#app/hooks/use-auth.ts";

export function NavUser() {
	const { user, signOut } = useAuth();
	const reactId = useId();

	if (!user) return null;

	return (
		<SidebarMenu id={`${reactId}-nav-user`}>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<SidebarMenuButton
								size="lg"
								className="text-sidebar-foreground rounded-none px-4 hover:bg-transparent"
							/>
						}
					>
						<UserAvatar name={user.name} image={user.image} className="size-6" />
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">{user.name}</span>
							{/* <span className="truncate text-xs">{user.email}</span> */}
						</div>
						<DotsThreeVerticalIcon className="ml-auto size-4" />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--anchor-width) min-w-52 rounded-lg"
						align="end"
						side="right"
					>
						<DropdownMenuGroup>
							<DropdownMenuItem
								render={
									<Link
										to="/account/preferences"
										disabled={!KEYBOARD_SHORTCUTS.goto_preferences.enabled}
									/>
								}
							>
								<SlidersHorizontalIcon />
								Preferences
							</DropdownMenuItem>
							<DropdownMenuItem
								render={
									<Link to="/account/tokens" disabled={!KEYBOARD_SHORTCUTS.goto_tokens.enabled} />
								}
							>
								<KeyIcon />
								Access tokens
							</DropdownMenuItem>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

						<DropdownMenuItem onClick={() => signOut()}>
							<SignOutIcon />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
