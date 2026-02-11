import { ExternalLinkIcon } from "@hoalu/icons/lucide";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@hoalu/ui/sidebar";
import { useId } from "react";

export function NavDocumentation() {
	const reactId = useId();

	return (
		<SidebarGroup id={`${reactId}-nav-docs`} className="mt-auto mb-2">
			<SidebarGroupLabel>Documentation</SidebarGroupLabel>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						render={
							<a href={`${import.meta.env.PUBLIC_API_URL}/docs`} target="_blank" rel="noreferrer">
								<ExternalLinkIcon />
								<span>Docs</span>
							</a>
						}
						tooltip="Docs"
					/>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuButton
						render={
							<a
								href={`${import.meta.env.PUBLIC_API_URL}/reference`}
								target="_blank"
								rel="noreferrer"
							>
								<ExternalLinkIcon />
								<span>API reference</span>
							</a>
						}
						tooltip="API reference"
					/>
				</SidebarMenuItem>
				<SidebarMenuItem>
					<SidebarMenuButton
						render={
							<a
								href={"https://github.com/quanphm/hoalu/releases"}
								target="_blank"
								rel="noreferrer"
							>
								<ExternalLinkIcon />
								<span>Changelog</span>
							</a>
						}
						tooltip="Changelog"
					/>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
