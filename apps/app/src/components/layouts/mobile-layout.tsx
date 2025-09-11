import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { useTheme } from "next-themes";

import { ChevronsUpDownIcon } from "@hoalu/icons/lucide";
import {
	AlignBoxTopCenterIcon,
	ArrowsExchangeIcon,
	LayoutDashboardIcon,
	SettingsIcon,
} from "@hoalu/icons/tabler";
import { Avatar, AvatarFallback } from "@hoalu/ui/avatar";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { ButtonLink } from "@/components/button-link";
import { KEYBOARD_SHORTCUTS } from "@/helpers/constants";
import { listWorkspacesOptions } from "@/services/query-options";

interface LayoutProps {
	children: React.ReactNode;
}

export function MobileLayout({ children }: LayoutProps) {
	const params = useParams({ strict: false });
	const hasSlug = !!params.slug;
	const { theme } = useTheme();

	return (
		<div className={cn("flex flex-col bg-background", theme)}>
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

	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());
	const currentWorkspace = workspaces.find((ws) => ws.slug === params.slug);
	const handleWorkspaceSwitcher = () => {};

	if (!currentWorkspace) {
		return null;
	}

	return (
		<header className="border-b bg-background">
			<div className="flex h-14 items-center justify-between px-8 md:px-4">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={handleWorkspaceSwitcher}
						className="flex items-center gap-2 px-2 py-1.5"
					>
						<Avatar className="h-6 w-6">
							<AvatarFallback className="font-medium text-xs">
								{currentWorkspace.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<span className="font-medium">{currentWorkspace.name}</span>
						<ChevronsUpDownIcon className="h-3 w-3 text-muted-foreground" />
					</Button>
				</div>
			</div>
		</header>
	);
}

function MobileBottomNav() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	return (
		<nav className="fixed bottom-0 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-16 items-center justify-around px-2">
				<ButtonLink
					to="/$slug"
					params={{ slug }}
					size="sm"
					variant="ghost"
					activeOptions={{ exact: true }}
					className={cn(
						"relative flex h-12 min-w-12 flex-col items-center justify-center gap-1 px-2 py-1",
						"font-medium text-xs",
					)}
				>
					<LayoutDashboardIcon className="size-5" />
					<span className="truncate text-xs leading-none">Dashboard</span>
				</ButtonLink>
				<ButtonLink
					to="/$slug/expenses"
					params={{ slug }}
					size="sm"
					variant="ghost"
					activeOptions={{ exact: true }}
					className={cn(
						"relative flex h-12 min-w-12 flex-col items-center justify-center gap-1 px-2 py-1",
						"font-medium text-xs",
					)}
				>
					<ArrowsExchangeIcon className="size-5" />
					<span className="truncate text-xs leading-none">Expense</span>
				</ButtonLink>
				<ButtonLink
					to="/$slug/tasks"
					params={{ slug }}
					size="sm"
					variant="ghost"
					activeOptions={{ exact: true }}
					className={cn(
						"relative flex h-12 min-w-12 flex-col items-center justify-center gap-1 px-2 py-1",
						"font-medium text-xs",
					)}
					disabled={!KEYBOARD_SHORTCUTS.goto_tasks.enabled}
				>
					<AlignBoxTopCenterIcon className="size-5" />
					<span className="truncate text-xs leading-none">Tasks</span>
				</ButtonLink>
				<ButtonLink
					to="/$slug/settings"
					params={{ slug }}
					size="sm"
					variant="ghost"
					activeOptions={{ exact: true }}
					className={cn(
						"relative flex h-12 min-w-12 flex-col items-center justify-center gap-1 px-2 py-1",
						"font-medium text-xs",
					)}
				>
					<SettingsIcon className="size-5" />
					<span className="truncate text-xs leading-none">Settings</span>
				</ButtonLink>
			</div>
		</nav>
	);
}
