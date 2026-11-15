import {
	ArrowsClockwiseIcon,
	BuildingsIcon,
	CalendarStarIcon,
	TagIcon,
	UsersIcon,
	WalletIcon,
} from "@hoalu/icons/phosphor";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@hoalu/ui/drawer";
import { cn } from "@hoalu/ui/utils";
import { Link } from "@tanstack/react-router";

const rowClass = cn(
	"flex min-h-12 items-center gap-3 px-4 text-sm font-medium",
	"text-foreground touch-manipulation select-none",
	"transition-colors duration-150 ease-out",
	"data-[status=active]:bg-accent active:bg-accent",
	"[@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent",
	"focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
);

const rowIconClass = "text-muted-foreground size-5 shrink-0";

interface MobileMoreDrawerProps {
	slug: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function MobileMoreDrawer({ slug, open, onOpenChange }: MobileMoreDrawerProps) {
	const close = () => onOpenChange(false);

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
			<DrawerContent className="bg-popover [&>div:first-child]:bg-foreground/20 rounded-t-xl pb-[env(safe-area-inset-bottom)]">
				<DrawerTitle className="sr-only">More</DrawerTitle>
				<DrawerDescription className="sr-only">
					Recurring bills, events, categories, wallets, and workspace settings.
				</DrawerDescription>
				<div className="mt-2 pb-2">
					<Link to="/$slug/recurring-bills" params={{ slug }} className={rowClass} onClick={close}>
						<ArrowsClockwiseIcon className={rowIconClass} aria-hidden="true" />
						Recurring Bills
					</Link>
					<Link to="/$slug/events" params={{ slug }} className={rowClass} onClick={close}>
						<CalendarStarIcon className={rowIconClass} aria-hidden="true" />
						Events
					</Link>
					<Link to="/$slug/categories" params={{ slug }} className={rowClass} onClick={close}>
						<TagIcon className={rowIconClass} aria-hidden="true" />
						Categories
					</Link>
					<Link to="/$slug/wallets" params={{ slug }} className={rowClass} onClick={close}>
						<WalletIcon className={rowIconClass} aria-hidden="true" />
						Wallets
					</Link>
					<Link
						to="/$slug/settings/workspace"
						params={{ slug }}
						className={rowClass}
						onClick={close}
					>
						<BuildingsIcon className={rowIconClass} aria-hidden="true" />
						Workspace
					</Link>
					<Link to="/$slug/settings/members" params={{ slug }} className={rowClass} onClick={close}>
						<UsersIcon className={rowIconClass} aria-hidden="true" />
						Members
					</Link>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
