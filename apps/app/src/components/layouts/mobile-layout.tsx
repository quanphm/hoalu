import {
	CaretUpDownIcon,
	GearSixIcon,
	MagnifyingGlassIcon,
	ReceiptIcon,
	SquaresFourIcon,
} from "@hoalu/icons/phosphor";
import { Avatar, AvatarFallback } from "@hoalu/ui/avatar";
import { Button } from "@hoalu/ui/button";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { commandPaletteOpen$ } from "#app/atoms/index.ts";
import { ButtonLink } from "#app/components/button-link.tsx";
import { listWorkspacesOptions } from "#app/services/query-options.ts";

interface LayoutProps {
	children: React.ReactNode;
}

export function MobileLayout({ children }: LayoutProps) {
	const params = useParams({ strict: false });
	const hasSlug = !!params.slug;

	return (
		<div className="bg-background flex flex-col">
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
		<header className="bg-background border-b pt-[env(safe-area-inset-top)]">
			<div className="flex min-h-14 items-center justify-between px-2 md:px-4">
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={handleWorkspaceSwitcher}
						aria-label="Switch workspace"
						className="flex items-center gap-2 px-2 py-1.5"
					>
						<Avatar className="size-6">
							<AvatarFallback className="text-xs">
								{currentWorkspace.name.charAt(0).toUpperCase()}
							</AvatarFallback>
						</Avatar>
						<span className="font-medium">{currentWorkspace.name}</span>
						<CaretUpDownIcon className="text-muted-foreground h-3 w-3" aria-hidden="true" />
					</Button>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="icon-lg"
						aria-label="Search"
						onClick={() => commandPaletteOpen$.set(true)}
					>
						<MagnifyingGlassIcon />
					</Button>
				</div>
			</div>
		</header>
	);
}

function MobileBottomNav() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	const navItemClass = cn(
		"relative flex h-full w-full flex-col items-center justify-center gap-1.5 px-2 py-2",
		"text-sm font-medium",
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
			<div className="grid grid-cols-3 gap-1 p-1">
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
					activeProps={{
						className: activeNavItemClass,
					}}
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
					activeProps={{
						className: activeNavItemClass,
					}}
				>
					<GearSixIcon className="size-6" aria-hidden="true" />
					<span className="truncate text-xs leading-none">Settings</span>
				</ButtonLink>
			</div>
		</nav>
	);
}
