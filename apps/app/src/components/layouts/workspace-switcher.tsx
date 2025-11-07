import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { useSetAtom } from "jotai";

import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "@hoalu/icons/lucide";
import { HouseIcon, LinkIcon } from "@hoalu/icons/nucleo";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuGroupLabel,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { ScrollArea } from "@hoalu/ui/scroll-area";
import { SidebarMenuButton } from "@hoalu/ui/sidebar";
import { cn } from "@hoalu/ui/utils";

import { createWorkspaceDialogAtom } from "#app/atoms/index.ts";
import { HotKey } from "#app/components/hotkey.tsx";
import { S3WorkspaceLogo } from "#app/components/workspace.tsx";
import { KEYBOARD_SHORTCUTS } from "#app/helpers/constants.ts";
import { listWorkspacesOptions } from "#app/services/query-options.ts";

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
	const setDialog = useSetAtom(createWorkspaceDialogAtom);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<SidebarMenuButton
						size="lg"
						className="border border-border/50 bg-background data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					/>
				}
			>
				<S3WorkspaceLogo {...selectedWorkspace} />
				<div className="grid flex-1 text-left text-sm leading-tight">
					<span className="truncate font-semibold">{selectedWorkspace.name}</span>
				</div>
				<ChevronsUpDownIcon className="ml-auto" />
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-(--anchor-width) rounded-lg" side="bottom" sideOffset={4}>
				<DropdownMenuItem className="gap-2 p-2" render={<Link to="/" />}>
					<HouseIcon />
					Home
					<HotKey {...KEYBOARD_SHORTCUTS.goto_home} />
				</DropdownMenuItem>
				<DropdownMenuItem
					className="gap-2 p-2"
					render={
						<a href="https://hoalu.app" target="_blank" rel="noreferrer">
							<LinkIcon />
							<span>
								Website <span className="text-muted-foreground text-xs">hoalu.app</span>
							</span>
						</a>
					}
				/>
				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuGroupLabel className="text-muted-foreground/60 text-xs">
						Workspaces
					</DropdownMenuGroupLabel>
					<ScrollArea className="max-h-72">
						{workspaces.map((ws) => (
							<DropdownMenuItem
								key={ws.publicId}
								className="gap-2 p-2"
								render={<Link to="/$slug" params={{ slug: ws.slug }} />}
							>
								<S3WorkspaceLogo slug={ws.slug} logo={ws.logo} name={ws.name} size="sm" />
								{ws.name}
								<CheckIcon
									className={cn("ml-auto", ws.slug === params.slug ? "opacity-100" : "opacity-0")}
								/>
							</DropdownMenuItem>
						))}
					</ScrollArea>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuItem className="gap-2 p-2" onClick={() => setDialog({ state: true })}>
					<div className="flex size-4 items-center justify-center text-muted-foreground">
						<PlusIcon className="size-4" />
					</div>
					<div className="font-medium text-muted-foreground">Create a workspace</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
