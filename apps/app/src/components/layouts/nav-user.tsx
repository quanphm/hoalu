import { UserAvatar } from "@/components/user-avatar";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { useAuth } from "@/hooks/use-auth";
import {
	CheckIcon,
	ChevronsUpDownIcon,
	KeyRoundIcon,
	LogOutIcon,
	Monitor,
	MoonIcon,
	PaletteIcon,
	SettingsIcon,
	SunIcon,
} from "@hoalu/icons/lucide";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@hoalu/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { HotKey } from "../hotkey";

export function NavUser() {
	const { user, signOut } = useAuth();
	const { theme, setTheme } = useTheme();

	if (!user) return null;

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<UserAvatar name={user.name} image={user.image} />
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.name}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDownIcon className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-52 rounded-lg"
						align="end"
						side="bottom"
					>
						<DropdownMenuGroup>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<PaletteIcon />
									<span>Themes</span>
									<HotKey className="ml-auto">{KEYBOARD_SHORTCUTS.toggle_theme.label}</HotKey>
								</DropdownMenuSubTrigger>
								<DropdownMenuPortal>
									<DropdownMenuSubContent>
										<DropdownMenuItem onClick={() => setTheme("light")}>
											<SunIcon />
											<span>Light</span>
											{theme === "light" && <CheckIcon className="ml-auto" />}
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setTheme("dark")}>
											<MoonIcon />
											<span>Dark</span>
											{theme === "dark" && <CheckIcon className="ml-auto" />}
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setTheme("system")}>
											<Monitor />
											<span>System</span>
											{theme === "system" && <CheckIcon className="ml-auto" />}
										</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>
						</DropdownMenuGroup>

						<DropdownMenuSeparator />

						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link to="/account/preferences">
									<SettingsIcon />
									Preferences
									<HotKey className="ml-auto">{KEYBOARD_SHORTCUTS.goto_preferences.label}</HotKey>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to="/account/tokens">
									<KeyRoundIcon />
									Access tokens
									<HotKey className="ml-auto">{KEYBOARD_SHORTCUTS.goto_tokens.label}</HotKey>
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => signOut()}>
							<LogOutIcon />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
