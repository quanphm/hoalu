import { NavMain } from "@/components/layouts/nav-main";
import { extractLetterFromName } from "@/helpers/extract-letter-from-name";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@hoalu/ui/avatar";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@hoalu/ui/sidebar";
import { Link } from "@tanstack/react-router";

export function SidebarLeft() {
	const { data: workspace } = authClient.useActiveWorkspace();

	if (!workspace) {
		return null;
	}

	return (
		<Sidebar variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to="/$slug" params={{ slug: workspace.slug }}>
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarImage src={workspace.logo || ""} alt={workspace.name} />
									<AvatarFallback>{extractLetterFromName(workspace.name)}</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{workspace.name}</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain />
			</SidebarContent>
		</Sidebar>
	);
}
