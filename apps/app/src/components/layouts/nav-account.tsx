import { ChevronRight, Settings2 } from "@hoalu/icons/lucide";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@hoalu/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@hoalu/ui/sidebar";

const data = [
	{
		title: "Settings",
		url: "#",
		icon: Settings2,
		items: [
			{
				title: "General",
				url: "#",
			},
			{
				title: "Team",
				url: "#",
			},
			{
				title: "Billing",
				url: "#",
			},
			{
				title: "Limits",
				url: "#",
			},
		],
	},
];

export function NavAccount() {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Account</SidebarGroupLabel>
			<SidebarMenu>
				{data.map((item) => (
					<Collapsible key={item.title} asChild>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip={item.title}>
								<a href={item.url}>
									<item.icon />
									<span>{item.title}</span>
								</a>
							</SidebarMenuButton>
							{item.items?.length ? (
								<>
									<CollapsibleTrigger asChild>
										<SidebarMenuAction className="data-[state=open]:rotate-90">
											<ChevronRight />
											<span className="sr-only">Toggle</span>
										</SidebarMenuAction>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items?.map((subItem) => (
												<SidebarMenuSubItem key={subItem.title}>
													<SidebarMenuSubButton asChild>
														<a href={subItem.url}>
															<span>{subItem.title}</span>
														</a>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</>
							) : null}
						</SidebarMenuItem>
					</Collapsible>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
