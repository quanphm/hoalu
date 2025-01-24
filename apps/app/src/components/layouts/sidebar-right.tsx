import { NavUser } from "@/components/layouts/nav-user";
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader } from "@hoalu/ui/sidebar";
import { Calendar } from "../calendar";

export function SidebarRight() {
	return (
		<Sidebar
			variant="inset"
			collapsible="none"
			className="fixed inset-y-0 right-0 flex h-svh w-[16rem] gap-2 p-2"
		>
			<SidebarHeader>
				<NavUser />
			</SidebarHeader>
			<SidebarContent className="border-border border-t">
				<SidebarGroup>
					<Calendar />
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
