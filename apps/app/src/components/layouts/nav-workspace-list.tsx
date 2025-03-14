import { HotKey } from "@/components/hotkey";
import { AVAILABLE_WORKSPACE_SHORTCUT } from "@/helpers/constants";
import { listWorkspacesOptions } from "@/services/query-options";
import { FolderClosedIcon } from "@hoalu/icons/lucide";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuBadge,
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
				{workspaces.map((ws, idx) => (
					<SidebarMenuItem key={ws.publicId}>
						<SidebarMenuButton asChild tooltip={ws.name}>
							<Link to="/$slug" params={{ slug: ws.slug }}>
								<FolderClosedIcon />
								<span>{ws.name}</span>
								{idx + 1 <= AVAILABLE_WORKSPACE_SHORTCUT.length && (
									<SidebarMenuBadge>
										<HotKey>{idx + 1}</HotKey>
									</SidebarMenuBadge>
								)}
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
