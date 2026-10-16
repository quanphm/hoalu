import { cn } from "@hoalu/ui/utils";
import { Link } from "@tanstack/react-router";

import { WORKSPACE_NAV } from "#app/helpers/nav.ts";

/**
 * The horizontal tab strip under the top bar.
 *
 * TanStack Router owns the active state, so the underline is drawn by a
 * pseudo-element that `activeProps` switches on — the same technique the mobile
 * bottom nav uses. Deliberately not base-ui `Tabs`, which switches local panels
 * rather than routes.
 */
export function TopNav({ slug }: { slug: string }) {
	return (
		<nav
			aria-label="Workspace"
			className="[scrollbar-width:none] overflow-x-auto border-b px-4 [&::-webkit-scrollbar]:hidden"
		>
			<ul className="flex items-center gap-0.5">
				{WORKSPACE_NAV.map((item) => (
					<li key={item.to}>
						<Link
							to={item.to}
							params={{ slug }}
							activeOptions={{ exact: item.exact }}
							className={cn(
								"text-muted-foreground hover:text-foreground relative flex h-10 items-center px-2.5 text-sm font-medium whitespace-nowrap transition-colors",
								"before:bg-foreground before:absolute before:inset-x-1.5 before:bottom-0 before:h-0.5 before:rounded-full before:opacity-0 before:transition-opacity",
							)}
							activeProps={{ className: "text-foreground before:opacity-100" }}
						>
							{item.label}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}
