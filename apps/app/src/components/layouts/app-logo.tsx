import { Link } from "@tanstack/react-router";

import { BotIcon } from "@hoalu/icons/lucide";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@hoalu/ui/sidebar";

export function AppLogo() {
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton size="lg" variant="outline" asChild>
					<Link to="/">
						<div className="flex aspect-square size-8 items-center justify-center">
							<BotIcon className="size-8" />
						</div>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">HoaLu.app</span>
						</div>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
