import { cn } from "@hoalu/ui/utils";
import { Link, useParams } from "@tanstack/react-router";

import { SETTINGS_NAV } from "#app/helpers/nav.ts";

/**
 * The settings sub-navigation: a bordered tray holding the destinations, with
 * the current one filled. Mirrors the shape the top tab strip uses, one level in.
 */
export function SettingsNav() {
	const { slug } = useParams({ from: "/_dashboard/$slug" });

	return (
		<nav aria-label="Settings" className="bg-card shadow-elements rounded-xl border p-1">
			<ul className="flex flex-col gap-0.5">
				{SETTINGS_NAV.map((item) => {
					const Icon = item.icon;
					return (
						<li key={item.to}>
							<Link
								to={item.to}
								params={{ slug }}
								activeOptions={{ exact: true }}
								className={cn(
									"text-muted-foreground hover:bg-overlay-hover hover:text-foreground flex h-8 items-center gap-2 rounded-lg px-2.5 text-sm font-medium transition-colors",
								)}
								activeProps={{ className: "bg-secondary text-foreground" }}
							>
								<Icon className="size-4" aria-hidden="true" />
								{item.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
