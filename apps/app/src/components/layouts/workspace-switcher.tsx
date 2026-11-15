import { CaretDownIcon, CheckIcon, HouseIcon, PlusIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { ScrollArea } from "@hoalu/ui/scroll-area";
import { SidebarMenuButton } from "@hoalu/ui/sidebar";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";

import { createWorkspaceDialog } from "#app/atoms/index.ts";
import { S3WorkspaceLogo } from "#app/components/workspace.tsx";
import { listWorkspacesOptions } from "#app/services/query-options.ts";

interface Props {
	selectedWorkspace: {
		name: string;
		slug: string;
		logo?: string | null | undefined;
	};
	/** `sidebar` sits in the desktop rail; `compact` is the chip in the phone header. */
	variant?: "sidebar" | "compact";
}

export function WorkspaceSwitcher({ selectedWorkspace, variant = "sidebar" }: Props) {
	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());
	const params = useParams({ from: "/_dashboard/$slug" });
	const setDialog = createWorkspaceDialog.set;
	const compact = variant === "compact";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					compact ? (
						<Button
							variant="outline"
							aria-label={`Switch workspace, ${selectedWorkspace.name}`}
							className="min-w-0 touch-manipulation gap-2 ps-1.5 pe-2 font-medium"
						/>
					) : (
						<SidebarMenuButton size="lg" className="border-border bg-input/32" />
					)
				}
			>
				{compact ? (
					<>
						<S3WorkspaceLogo {...selectedWorkspace} size="sm" />
						<span className="max-w-40 truncate">{selectedWorkspace.name}</span>
						<CaretDownIcon className="text-muted-foreground size-3.5 shrink-0" aria-hidden="true" />
					</>
				) : (
					<>
						<S3WorkspaceLogo {...selectedWorkspace} />
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">{selectedWorkspace.name}</span>
						</div>
						<CaretDownIcon className="ml-auto" />
					</>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className={cn("rounded-lg", compact ? "min-w-60" : "w-(--anchor-width)")}
				align="start"
				side={compact ? "bottom" : "right"}
				sideOffset={6}
			>
				<DropdownMenuItem className="gap-2 p-2" render={<Link to="/" />}>
					<HouseIcon />
					Home
				</DropdownMenuItem>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
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
					<div className="text-muted-foreground flex size-4 items-center justify-center">
						<PlusIcon className="size-4" />
					</div>
					<div className="text-muted-foreground font-medium">Create workspace</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
