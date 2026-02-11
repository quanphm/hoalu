import { HotKey } from "#app/components/hotkey.tsx";
import { AVAILABLE_WORKSPACE_SHORTCUT } from "#app/helpers/constants.ts";
import { listWorkspacesOptions } from "#app/services/query-options.ts";
import { FolderIcon } from "@hoalu/icons/nucleo";
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
import { useId } from "react";

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
							{idx + 1 <= AVAILABLE_WORKSPACE_SHORTCUT.length && (
								<SidebarMenuBadge>
									<HotKey enabled label={idx + 1} />
								</SidebarMenuBadge>
							)}
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
