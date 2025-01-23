import { useAuth } from "@/hooks/useAuth";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@tanstack/react-router";
import { BadgeCheckIcon, BellIcon, ChevronsUpDownIcon, LogOutIcon } from "@woben/icons/lucide";
import { Avatar, AvatarFallback, AvatarImage } from "@woben/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@woben/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@woben/ui/sidebar";

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
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage src={user.image || ""} alt={user.name} />
								<AvatarFallback className="rounded-lg">{user.name}</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{user.name}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
							<ChevronsUpDownIcon className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-48 rounded-lg"
						side="right"
						align="end"
					>
						<DropdownMenuGroup>
							<DropdownMenuItem>Personal Settings</DropdownMenuItem>
							<DropdownMenuItem>Notifications</DropdownMenuItem>
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
