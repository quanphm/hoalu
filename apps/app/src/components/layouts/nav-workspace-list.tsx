import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useId } from "react";

import { FolderIcon } from "@hoalu/icons/tabler";
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
	const reactId = useId();
	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());

	if (workspaces.length === 0) {
		return null;
	}

	return (
		<SidebarGroup id={`${reactId}-nav-account`}>
			<SidebarGroupLabel>Workspaces</SidebarGroupLabel>
			<SidebarMenu>
				{workspaces.map((ws, idx) => (
					<SidebarMenuItem key={ws.publicId}>
						<SidebarMenuButton asChild tooltip={ws.name}>
							<Link to="/$slug" params={{ slug: ws.slug }}>
								<FolderIcon />
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
