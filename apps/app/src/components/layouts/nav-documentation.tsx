import { ExternalLinkIcon } from "@hoalu/icons/lucide";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@hoalu/ui/sidebar";

export function NavDocumentation() {
	return (
		<SidebarGroup id="nav-documentation" className="mt-auto mb-2">
			<SidebarGroupLabel>Documentation</SidebarGroupLabel>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Docs">
						<a href={`${import.meta.env.PUBLIC_API_URL}/docs`} target="_blank" rel="noreferrer">
							<ExternalLinkIcon />
							<span>Docs</span>
						</a>
					</SidebarMenuButton>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="API reference">
						<a
							href={`${import.meta.env.PUBLIC_API_URL}/reference`}
							target="_blank"
							rel="noreferrer"
						>
							<ExternalLinkIcon />
							<span>API reference</span>
						</a>
					</SidebarMenuButton>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Changelog">
						<a href={"https://github.com/quanphm/hoalu/releases"} target="_blank" rel="noreferrer">
							<ExternalLinkIcon />
							<span>Changelog</span>
						</a>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
