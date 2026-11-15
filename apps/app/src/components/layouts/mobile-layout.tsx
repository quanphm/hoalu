import {
	DotsThreeIcon,
	ImagesIcon,
	MagnifyingGlassIcon,
	ReceiptIcon,
	SquaresFourIcon,
} from "@hoalu/icons/phosphor";
import { cn } from "@hoalu/ui/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "@tanstack/react-router";
import { useState } from "react";

import { commandPaletteOpen$ } from "#app/atoms/index.ts";
import { MobileMoreDrawer } from "#app/components/layouts/mobile-more-drawer.tsx";
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
		<div
			className={cn(
				/**
				 * Pinned, not sized. In an installed iOS web app every height API lies by about the status
				 * bar (`innerHeight`, `100dvh`, `100svh`), which floats a bottom-anchored bar off the real
				 * screen edge; `fixed` resolves against the actual viewport rect instead. Do not swap this
				 * back to a `h-*` class.
				 */
				"bg-background fixed inset-0 flex flex-col overflow-hidden",
				NAV_HEIGHT,
			)}
		>
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
			<div className="flex min-h-14 items-center gap-2 px-3">
				<WorkspaceSwitcher variant="compact" selectedWorkspace={currentWorkspace} />
			</div>
		</header>
	);
}

const navTabClass = cn(
	"relative isolate flex h-full w-full flex-col items-center justify-center rounded-lg",
	"text-muted-foreground touch-manipulation select-none",
	"transition-colors duration-150 ease-out outline-none",
	"data-[status=active]:text-foreground",
	"active:text-foreground",
	"[@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground",
	"focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-inset",
	"before:bg-accent before:pointer-events-none before:absolute before:inset-1 before:-z-10 before:rounded-lg before:opacity-0 before:transition-opacity before:duration-150 before:content-['']",
	"active:before:opacity-100",
);

const moreSegments = [
	"/recurring-bills",
	"/events",
	"/categories",
	"/wallets",
	"/settings",
] as const;

function MobileBottomNav() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const { pathname } = useLocation();
	const [moreOpen, setMoreOpen] = useState(false);
	const isMoreActive = moreSegments.some((segment) => pathname.startsWith(`/${slug}${segment}`));

	return (
		<>
			<nav
				aria-label="Main"
				className="bg-background/85 supports-backdrop-filter:bg-background/70 absolute inset-x-0 bottom-0 z-50 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
			>
				<div className="grid h-(--mobile-nav-height) grid-cols-5">
					<Link
						to="/$slug"
						params={{ slug }}
						activeOptions={{ exact: true }}
						activeProps={{ "aria-current": "page" }}
						preload="render"
						aria-label="Dashboard"
						className={navTabClass}
					>
						{({ isActive }) => (
							<SquaresFourIcon
								className="size-6"
								weight={isActive ? "fill" : "regular"}
								aria-hidden="true"
							/>
						)}
					</Link>
					<Link
						to="/$slug/transactions"
						params={{ slug }}
						activeProps={{ "aria-current": "page" }}
						preload="render"
						aria-label="Transactions"
						className={navTabClass}
					>
						{({ isActive }) => (
							<ReceiptIcon
								className="size-6"
								weight={isActive ? "fill" : "regular"}
								aria-hidden="true"
							/>
						)}
					</Link>
					<Link
						to="/$slug/files"
						params={{ slug }}
						activeProps={{ "aria-current": "page" }}
						preload="render"
						aria-label="Files"
						className={navTabClass}
					>
						{({ isActive }) => (
							<ImagesIcon
								className="size-6"
								weight={isActive ? "fill" : "regular"}
								aria-hidden="true"
							/>
						)}
					</Link>
					<button
						type="button"
						aria-label="Search"
						onClick={() => commandPaletteOpen$.set(true)}
						className={navTabClass}
					>
						<MagnifyingGlassIcon className="size-6" aria-hidden="true" />
					</button>
					<button
						type="button"
						aria-label="More"
						aria-haspopup="dialog"
						aria-expanded={moreOpen}
						onClick={() => setMoreOpen(true)}
						className={cn(navTabClass, isMoreActive && "text-foreground")}
					>
						<DotsThreeIcon
							className="size-6"
							weight={isMoreActive ? "bold" : "regular"}
							aria-hidden="true"
						/>
					</button>
				</div>
			</nav>
			<MobileMoreDrawer slug={slug} open={moreOpen} onOpenChange={setMoreOpen} />
		</>
	);
}
