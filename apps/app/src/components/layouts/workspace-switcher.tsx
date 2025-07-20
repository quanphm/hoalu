import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";

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
import { HotKey } from "@/components/hotkey";
import {
	CreateWorkspaceDialog,
	CreateWorkspaceDialogTrigger,
	S3WorkspaceLogo,
} from "@/components/workspace";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { listWorkspacesOptions } from "@/services/query-options";

interface Props {
	selectedWorkspace: {
		name: string;
		slug: string;
		logo?: string | null | undefined;
	};
}

export function WorkspaceSwitcher({ selectedWorkspace }: Props) {
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
								className="border border-border/50 bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<S3WorkspaceLogo
									slug={selectedWorkspace.slug}
									logo={selectedWorkspace.logo}
									name={selectedWorkspace.name}
								/>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{selectedWorkspace.name}</span>
								</div>
								<ChevronsUpDownIcon className="ml-auto" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-(--radix-dropdown-menu-trigger-width) rounded-lg"
							side="bottom"
							sideOffset={4}
						>
							<DropdownMenuItem className="gap-2 p-2" asChild>
								<Link to="/">
									<HomeIcon />
									Home
									<HotKey className="ml-auto" {...KEYBOARD_SHORTCUTS.goto_home} />
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
											<S3WorkspaceLogo slug={ws.slug} logo={ws.logo} name={ws.name} size="sm" />
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
