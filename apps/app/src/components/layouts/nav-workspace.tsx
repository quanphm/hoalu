import {
	ChevronRightIcon,
	GalleryVerticalIcon,
	LandmarkIcon,
	ListTodoIcon,
	SettingsIcon,
	UsersIcon,
} from "@hoalu/icons/lucide";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@hoalu/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@hoalu/ui/sidebar";
import { Link, useLocation } from "@tanstack/react-router";

export function NavWorkspace() {
	const location = useLocation();

	return (
		<SidebarGroup id="nav-workspace">
			<SidebarGroupLabel>Workspace</SidebarGroupLabel>
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Overview">
						<Link from="/$slug/" to="." activeOptions={{ exact: true }}>
							<GalleryVerticalIcon />
							<span>Dashboard</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<Collapsible
					asChild
					className="group/collapsible"
					open={location.pathname.includes("finance")}
				>
					<SidebarMenuItem>
						<CollapsibleTrigger asChild>
							<SidebarMenuButton asChild tooltip="Finance">
								<Link from="/$slug/" to="./finance" activeOptions={{ exact: true }}>
									<LandmarkIcon />
									<span>Finance</span>
									<ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								</Link>
							</SidebarMenuButton>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<SidebarMenuSub>
								<SidebarMenuSubItem>
									<SidebarMenuSubButton asChild>
										<Link from="/$slug/" to="./finance/expenses">
											<span>Expenses</span>
										</Link>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
								<SidebarMenuSubItem>
									<SidebarMenuSubButton asChild>
										<Link from="/$slug/" to="./finance/wallets">
											<span>Wallets</span>
										</Link>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
								<SidebarMenuSubItem>
									<SidebarMenuSubButton asChild>
										<Link from="/$slug/" to="./finance/categories">
											<span>Categories</span>
										</Link>
									</SidebarMenuSubButton>
								</SidebarMenuSubItem>
							</SidebarMenuSub>
						</CollapsibleContent>
					</SidebarMenuItem>
				</Collapsible>

				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Tasks">
						<Link from="/$slug/" to="./tasks">
							<ListTodoIcon />
							<span>Tasks</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Settings">
						<Link from="/$slug/" to="./members">
							<UsersIcon />
							<span>Members</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>

				<SidebarMenuItem>
					<SidebarMenuButton asChild tooltip="Settings">
						<Link from="/$slug/" to="./settings">
							<SettingsIcon />
							<span>Settings</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	);
}
