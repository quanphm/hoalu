import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { FolderClosedIcon } from "@hoalu/icons/lucide";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@hoalu/ui/sidebar";
import { HotKey } from "@/components/hotkey";
import { AVAILABLE_WORKSPACE_SHORTCUT } from "@/helpers/constants";
import { listWorkspacesOptions } from "@/services/query-options";

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
										<HotKey enabled label={idx + 1} />
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
