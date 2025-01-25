import { ChevronsUpDownIcon, PlusIcon } from "@hoalu/icons/lucide";
import { AudioWaveformIcon, CommandIcon, GalleryVerticalEndIcon } from "@hoalu/icons/lucide";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@hoalu/ui/sidebar";

const teams = [
	{
		name: "Acme Inc",
		logo: GalleryVerticalEndIcon,
	},
	{
		name: "Acme Corp.",
		logo: AudioWaveformIcon,
	},
	{
		name: "Evil Corp.",
		logo: CommandIcon,
	},
];

export function WorkspaceSwitcher() {
	const activeTeam = teams[0];

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
								<activeTeam.logo className="size-4" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{activeTeam.name}</span>
							</div>
							<ChevronsUpDownIcon className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="start"
						side="bottom"
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Workspace
						</DropdownMenuLabel>
						{teams.map((team, index) => (
							<DropdownMenuItem key={team.name} className="gap-2 p-2">
								<div className="flex size-6 items-center justify-center rounded-sm border">
									<team.logo className="size-4 shrink-0" />
								</div>
								{team.name}
								<DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem className="gap-2 p-2">
							<div className="flex size-6 items-center justify-center rounded-md border bg-background">
								<PlusIcon className="size-4" />
							</div>
							<div className="font-medium text-muted-foreground">Create Workspace</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
