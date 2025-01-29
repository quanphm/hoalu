import { listWorkspacesOptions } from "@/lib/query-options";
import { HashIcon } from "@hoalu/icons/lucide";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@hoalu/ui/sidebar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

export function NavWorkspaceList() {
	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());

	if (workspaces.length === 0) {
		return null;
	}

	return (
		<SidebarGroup id="nav-account">
			<SidebarGroupLabel>Workspaces</SidebarGroupLabel>
			<SidebarMenu>
				{workspaces.map((ws) => (
					<SidebarMenuItem key={ws.publicId}>
						<SidebarMenuButton asChild tooltip={ws.name}>
							<Link to="/$slug" params={{ slug: ws.slug }}>
								<div className="flex size-6 items-center justify-center rounded-[6px] border bg-background">
									<HashIcon className="size-4" />
								</div>
								<span>{ws.name}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
