import { Calendar } from "@/components/calendar";
import { NavUser } from "@/components/layouts/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
} from "@hoalu/ui/sidebar";

export function AppSidebarRight() {
	return (
		<Sidebar
			variant="inset"
			collapsible="none"
			className="fixed inset-y-0 right-0 flex h-svh w-[16rem] gap-2 p-2"
		>
			<SidebarHeader>
				<NavUser />
			</SidebarHeader>
			<SidebarContent />
			<SidebarFooter>
				<SidebarMenu>
					<Calendar />
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
