import { CreateWorkspaceDialog, CreateWorkspaceDialogTrigger } from "@/components/create-workspace";
import { WorkspaceAvatar } from "@/components/workspace-avatar";
import { listWorkspacesOptions } from "@/services/query-options";
import {
	CheckIcon,
	ChevronsUpDownIcon,
	ExternalLinkIcon,
	HomeIcon,
	PlusIcon,
} from "@hoalu/icons/lucide";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { ScrollArea } from "@hoalu/ui/scroll-area";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@hoalu/ui/sidebar";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";

interface Props {
	currentWorkspace: {
		name: string;
		logo?: string | null;
	};
}

export function WorkspaceSwitcher({ currentWorkspace }: Props) {
	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());
	const params = useParams({ from: "/_dashboard/$slug" });

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<CreateWorkspaceDialog>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<WorkspaceAvatar logo={currentWorkspace?.logo} name={currentWorkspace.name} />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{currentWorkspace.name}</span>
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
							<ScrollArea className="max-h-72">
								{workspaces.map((ws) => (
									<DropdownMenuItem key={ws.publicId} className="gap-2 p-2" asChild>
										<Link to="/$slug" params={{ slug: ws.slug }}>
											<WorkspaceAvatar logo={ws.logo} name={ws.name} size="sm" />
											{ws.name}
											<CheckIcon
												className={cn(
													"ml-auto",
													ws.slug === params.slug ? "opacity-100" : "opacity-0",
												)}
											/>
										</Link>
									</DropdownMenuItem>
								))}
							</ScrollArea>
							<DropdownMenuSeparator />
							<CreateWorkspaceDialogTrigger>
								<DropdownMenuItem className="gap-2 p-2">
									<div className="flex size-4 items-center justify-center text-muted-foreground">
										<PlusIcon className="size-4" />
									</div>
									<div className="font-medium text-muted-foreground">Create a workspace</div>
								</DropdownMenuItem>
							</CreateWorkspaceDialogTrigger>
						</DropdownMenuContent>
					</DropdownMenu>
				</CreateWorkspaceDialog>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
