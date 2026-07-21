import { FolderIcon } from "@hoalu/icons/tabler";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@hoalu/ui/sidebar";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useId } from "react";

import { listWorkspacesOptions } from "#app/services/query-options.ts";

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
						<SidebarMenuButton
							render={<Link to="/$slug" params={{ slug: ws.slug }} />}
							tooltip={ws.name}
						>
							<FolderIcon />
							<span>{ws.name}</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
