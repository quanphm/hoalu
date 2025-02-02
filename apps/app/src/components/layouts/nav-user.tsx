import { UserAvatar } from "@/components/user-avatar";
import { useAuth } from "@/hooks/useAuth";
import { authClient } from "@/lib/auth-client";
import { ChevronsUpDownIcon, LogOutIcon } from "@hoalu/icons/lucide";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@hoalu/ui/sidebar";
import { Link, useRouter } from "@tanstack/react-router";

export function NavUser() {
	const { user } = useAuth();
	const router = useRouter();

	if (!user) {
		return null;
	}

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
					>
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link to="/account/preferences">Preferences</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link to="/account/tokens">Access tokens</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() =>
								authClient.signOut({
									fetchOptions: {
										onSuccess: () => {
											router.invalidate();
										},
									},
								})
							}
						>
							<LogOutIcon />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
