import {
	GearSixIcon,
	MagnifyingGlassIcon,
	ReceiptIcon,
	SquaresFourIcon,
} from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { commandPaletteOpen$ } from "#app/atoms/index.ts";
import { ButtonLink } from "#app/components/button-link.tsx";
import { WorkspaceSwitcher } from "#app/components/layouts/workspace-switcher.tsx";
import { listWorkspacesOptions } from "#app/services/query-options.ts";

interface LayoutProps {
	children: React.ReactNode;
}

/**
 * One source of truth for the bar's height: the nav sizes itself with it and the scroll area pads
 * with it plus the home-indicator inset, so the two cannot drift apart.
 */
const NAV_HEIGHT = "[--mobile-nav-height:3.5rem]";

export function MobileLayout({ children }: LayoutProps) {
	const params = useParams({ strict: false });
	const hasSlug = !!params.slug;

	return (
		<div className={cn("bg-background relative flex h-dvh flex-col overflow-hidden", NAV_HEIGHT)}>
			{hasSlug && <MobileHeader />}
			<main
				data-slot="main-content"
				className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom))]"
			>
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

	if (!currentWorkspace) {
		return null;
	}

	return (
		<header className="bg-background z-40 shrink-0 border-b pt-[env(safe-area-inset-top)]">
			<div className="flex min-h-14 items-center justify-between gap-2 px-3">
				<div className="flex min-w-0 items-center gap-2">
					<WorkspaceSwitcher variant="compact" selectedWorkspace={currentWorkspace} />
				</div>
				<Button
					variant="outline"
					size="icon-lg"
					aria-label="Search"
					className="shrink-0 touch-manipulation"
					onClick={() => commandPaletteOpen$.set(true)}
				>
					<MagnifyingGlassIcon />
				</Button>
			</div>
		</header>
	);
}

const navItemClass = cn(
	"relative flex h-full w-full flex-col items-center justify-center gap-1 px-2 py-1",
	"text-sm font-medium",
	"text-muted-foreground hover:text-foreground touch-manipulation",
);

const activeNavItemClass = cn(
	"bg-muted text-foreground",
	"before:bg-primary before:absolute before:top-0 before:left-1/2 before:h-0.5 before:w-12 before:-translate-x-1/2 before:rounded-full",
);

function MobileBottomNav() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	return (
		<nav
			aria-label="Main navigation"
			className="bg-background/85 supports-backdrop-filter:bg-background/70 absolute inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
		>
			<div className="grid h-(--mobile-nav-height) grid-cols-3 gap-1 p-1">
				<ButtonLink
					to="/$slug"
					params={{ slug }}
					size="sm"
					variant="ghost"
					activeOptions={{ exact: true }}
					className={navItemClass}
					activeProps={{ className: activeNavItemClass }}
				>
					<SquaresFourIcon className="size-6" aria-hidden="true" />
					<span className="truncate text-xs leading-none">Dashboard</span>
				</ButtonLink>
				<ButtonLink
					to="/$slug/transactions"
					params={{ slug }}
					size="sm"
					variant="ghost"
					activeOptions={{ exact: true }}
					className={navItemClass}
					activeProps={{ className: activeNavItemClass }}
				>
					<ReceiptIcon className="size-6" aria-hidden="true" />
					<span className="truncate text-xs leading-none">Transactions</span>
				</ButtonLink>
				<ButtonLink
					to="/$slug/settings/workspace"
					params={{ slug }}
					size="sm"
					variant="ghost"
					activeOptions={{ exact: true }}
					className={navItemClass}
					activeProps={{ className: activeNavItemClass }}
				>
					<GearSixIcon className="size-6" aria-hidden="true" />
					<span className="truncate text-xs leading-none">Settings</span>
				</ButtonLink>
			</div>
		</nav>
	);
}
