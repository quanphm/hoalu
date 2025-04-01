import { UserAvatar } from "@/components/user-avatar";
import { KEYBOARD_SHORTCUTS, THEMES } from "@/helpers/constants";
import { useAuth } from "@/hooks/use-auth";
import {
	CheckIcon,
	ChevronsUpDownIcon,
	KeyRoundIcon,
	LogOutIcon,
	PaletteIcon,
	SettingsIcon,
} from "@hoalu/icons/lucide";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
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
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground "
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
									<DropdownMenuShortcut>
										<HotKey {...KEYBOARD_SHORTCUTS.toggle_theme} />
									</DropdownMenuShortcut>
								</DropdownMenuSubTrigger>
								<DropdownMenuPortal>
									<DropdownMenuSubContent>
										{THEMES.map((themeName) => (
											<DropdownMenuItem
												key={themeName}
												onClick={() => setTheme(themeName)}
												className="capitalize"
											>
												{theme === themeName && (
													<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
														<CheckIcon className="size-4" />
													</span>
												)}
												<span className="ms-6">{themeName}</span>
											</DropdownMenuItem>
										))}
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={() => setTheme("system")}>
											{theme === "system" && (
												<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
													<CheckIcon className="size-4" />
												</span>
											)}
											<span className="ms-6">System</span>
										</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link
									to="/account/preferences"
									disabled={!KEYBOARD_SHORTCUTS.goto_preferences.enabled}
								>
									<SettingsIcon />
									Preferences
									<HotKey className="ml-auto" {...KEYBOARD_SHORTCUTS.goto_preferences} />
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to="/account/tokens" disabled={!KEYBOARD_SHORTCUTS.goto_tokens.enabled}>
									<KeyRoundIcon />
									Access tokens
									<HotKey className="ml-auto" {...KEYBOARD_SHORTCUTS.goto_tokens} />
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
