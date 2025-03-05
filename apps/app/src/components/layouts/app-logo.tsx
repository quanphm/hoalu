import { BotIcon } from "@hoalu/icons/lucide";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@hoalu/ui/sidebar";
import { Link } from "@tanstack/react-router";

export function AppLogo() {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size="lg" className="data-[status=active]:bg-transparent" asChild>
					<Link to="/">
						<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-amber-500 text-sidebar-primary-foreground">
							<BotIcon className="size-4" />
						</div>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">HoaLu.app Geist.l</span>
						</div>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
