import { WorkspaceAvatar } from "@/components/workspace-avatar";
import { ChevronsUpDownIcon, ExternalLinkIcon, HomeIcon, PlusIcon } from "@hoalu/icons/lucide";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@hoalu/ui/sidebar";
import { Link, useLoaderData, useParams } from "@tanstack/react-router";

export function WorkspaceSwitcher() {
	const { workspaces } = useLoaderData({ from: "/_dashboard" });
	const params = useParams({ strict: false });
	const currentWorkspace = workspaces.find((ws) => ws.slug === params.slug);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
								<WorkspaceAvatar logo={currentWorkspace?.logo} name={currentWorkspace?.name} />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{currentWorkspace?.name}</span>
							</div>
							<ChevronsUpDownIcon className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) rounded-lg"
						align="start"
						side="bottom"
						sideOffset={4}
					>
						<DropdownMenuItem className="gap-2 p-2" asChild>
							<Link to="/">
								<HomeIcon />
								<span>Home</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem className="gap-2 p-2" asChild>
							<a href="https://hoalu.app" target="_blank" rel="noreferrer">
								<ExternalLinkIcon />
								<span>
									Website <span className="text-muted-foreground text-xs">hoalu.app</span>
								</span>
							</a>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuLabel className="text-muted-foreground/60 text-xs">
							Workspaces
						</DropdownMenuLabel>
						{workspaces.map((ws) => (
							<DropdownMenuItem key={ws.publicId} className="gap-2 p-2" asChild>
								<Link to="/$slug" params={{ slug: ws.slug }}>
									<WorkspaceAvatar logo={ws.logo} name={ws.name} size="sm" />
									{ws.name}
								</Link>
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem className="gap-2 p-2" disabled>
							<div className="flex size-6 items-center justify-center rounded-md border bg-background">
								<PlusIcon className="size-4" />
							</div>
							<div className="font-medium text-muted-foreground">Create a workspace</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
