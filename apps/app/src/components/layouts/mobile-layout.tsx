import { ButtonLink } from "#app/components/button-link.tsx";
import { CUSTOM_THEMES, SYSTEM_THEMES, THEME_LABELS } from "#app/helpers/constants.ts";
import { listWorkspacesOptions } from "#app/services/query-options.ts";
import { CheckIcon, ChevronsUpDownIcon, PaletteIcon } from "@hoalu/icons/lucide";
import { ArrowsExchangeIcon, LayoutDashboardIcon, SettingsIcon } from "@hoalu/icons/tabler";
import { Avatar, AvatarFallback } from "@hoalu/ui/avatar";
import { Button } from "@hoalu/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@hoalu/ui/dropdown-menu";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useTheme } from "next-themes";

interface LayoutProps {
	children: React.ReactNode;
}

export function MobileLayout({ children }: LayoutProps) {
	const params = useParams({ strict: false });
	const hasSlug = !!params.slug;
	const { theme } = useTheme();

	return (
		<div className={cn("bg-background flex flex-col", theme)}>
			{hasSlug && <MobileHeader />}
			<main data-slot="main-content" className="pb-16">
				{children}
			</main>
			{hasSlug && <MobileBottomNav />}
		</div>
	);
}

function MobileHeader() {
	const params = useParams({ strict: false });
	const { theme, setTheme } = useTheme();

	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());
	const currentWorkspace = workspaces.find((ws) => ws.slug === params.slug);
	const handleWorkspaceSwitcher = () => {};

	if (!currentWorkspace) {
		return null;
	}

	return (
		<header className="bg-background border-b">
			<div className="flex h-14 items-center justify-between px-4">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={handleWorkspaceSwitcher}
						aria-label="Switch workspace"
						className="flex items-center gap-2 px-2 py-1.5"
					>
						<Avatar className="size-6">
							<AvatarFallback className="text-xs font-medium">
								{currentWorkspace.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<span className="font-medium">{currentWorkspace.name}</span>
						<ChevronsUpDownIcon className="text-muted-foreground h-3 w-3" aria-hidden="true" />
					</Button>
				</div>
				<div className="flex items-center">
					<DropdownMenu>
						<DropdownMenuTrigger
							render={<Button variant="ghost" size="icon" aria-label="Select theme" />}
						>
							<PaletteIcon className="size-5" />
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" role="menu">
							{SYSTEM_THEMES.map((themeName) => {
								const isSelected = theme === themeName;
								return (
									<DropdownMenuItem
										key={themeName}
										onClick={() => setTheme(themeName)}
										className="capitalize"
										role="menuitemradio"
										aria-checked={isSelected}
									>
										{isSelected && (
											<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
												<CheckIcon className="size-4" aria-hidden="true" />
											</span>
										)}
										<span className="ms-6">{THEME_LABELS[themeName]}</span>
									</DropdownMenuItem>
								);
							})}
							<DropdownMenuSeparator />
							{CUSTOM_THEMES.map((themeName) => {
								const isSelected = theme === themeName;
								return (
									<DropdownMenuItem
										key={themeName}
										onClick={() => setTheme(themeName)}
										className="capitalize"
										role="menuitemradio"
										aria-checked={isSelected}
									>
										{isSelected && (
											<span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
												<CheckIcon className="size-4" aria-hidden="true" />
											</span>
										)}
										<span className="ms-6">{THEME_LABELS[themeName]}</span>
									</DropdownMenuItem>
								);
							})}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}

function MobileBottomNav() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	const navItemClass = cn(
		"relative flex h-full w-full flex-col items-center justify-center gap-1.5 px-2 py-2",
		"text-sm font-medium transition-colors",
		"text-muted-foreground hover:text-foreground",
	);

	const activeNavItemClass = cn(
		"bg-muted text-foreground",
		"before:bg-primary before:absolute before:top-0 before:left-1/2 before:h-0.5 before:w-12 before:-translate-x-1/2 before:rounded-full",
	);

	return (
		<nav
			aria-label="Main navigation"
			className="bg-background/95 supports-backdrop-filter:bg-background/60 fixed bottom-0 z-50 w-full border-t pb-[env(safe-area-inset-bottom)] backdrop-blur"
		>
			<div className="grid h-20 grid-cols-3 gap-1 px-2 py-2">
				<ButtonLink
					to="/$slug"
					params={{ slug }}
					size="sm"
					variant="ghost"
					activeOptions={{ exact: true }}
					className={navItemClass}
					activeProps={{
						className: activeNavItemClass,
					}}
				>
					<LayoutDashboardIcon className="size-6" aria-hidden="true" />
					<span className="truncate text-xs leading-none">Dashboard</span>
				</ButtonLink>
				<ButtonLink
					to="/$slug/expenses"
					params={{ slug }}
					size="sm"
					variant="ghost"
					activeOptions={{ exact: true }}
					className={navItemClass}
					activeProps={{
						className: activeNavItemClass,
					}}
				>
					<ArrowsExchangeIcon className="size-6" aria-hidden="true" />
					<span className="truncate text-xs leading-none">Expense</span>
				</ButtonLink>
				{/* <ButtonLink
					to="/$slug/tasks"
					params={{ slug }}
					size="sm"
					variant="ghost"
					activeOptions={{ exact: true }}
					className={navItemClass}
					activeProps={{
						className: activeNavItemClass,
					}}
					disabled={!KEYBOARD_SHORTCUTS.goto_tasks.enabled}
				>
					<AlignBoxTopCenterIcon className="size-6" />
					<span className="truncate text-xs leading-none">Tasks</span>
				</ButtonLink> */}
				<ButtonLink
					to="/$slug/settings"
					params={{ slug }}
					size="sm"
					variant="ghost"
					activeOptions={{ exact: true }}
					className={navItemClass}
					activeProps={{
						className: activeNavItemClass,
					}}
				>
					<SettingsIcon className="size-6" aria-hidden="true" />
					<span className="truncate text-xs leading-none">Settings</span>
				</ButtonLink>
			</div>
		</nav>
	);
}
