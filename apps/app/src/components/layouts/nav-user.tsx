import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/hooks/use-auth";
import {
	ChevronsUpDownIcon,
	KeyRoundIcon,
	LanguagesIcon,
	LogOutIcon,
	Monitor,
	MoonIcon,
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
						className="w-(--radix-dropdown-menu-trigger-width) min-w-48 rounded-lg"
						align="center"
						side="bottom"
					>
						<DropdownMenuGroup>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									{theme === "dark" ? <MoonIcon /> : theme === "light" ? <SunIcon /> : <MoonIcon />}
									<span>Themes</span>
								</DropdownMenuSubTrigger>
								<DropdownMenuPortal>
									<DropdownMenuSubContent>
										<DropdownMenuItem onClick={() => setTheme("light")}>
											<SunIcon />
											<span>Light</span>
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setTheme("dark")}>
											<MoonIcon />
											<span>Dark</span>
											<MoonIcon />
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setTheme("system")}>
											<Monitor />
											<span>System</span>
										</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<LanguagesIcon />
									<span>Languages</span>
								</DropdownMenuSubTrigger>
								<DropdownMenuPortal>
									<DropdownMenuSubContent>
										<DropdownMenuItem>
											<span>English (US)</span>
										</DropdownMenuItem>
										<DropdownMenuItem>
											<span>Vietnamese</span>
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
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to="/account/tokens">
									<KeyRoundIcon />
									Access tokens
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
