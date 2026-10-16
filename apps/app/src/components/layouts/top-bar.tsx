import { MagnifyingGlassIcon } from "@hoalu/icons/phosphor";
import { Button } from "@hoalu/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { commandPaletteOpen$ } from "#app/atoms/index.ts";
import { AppLogo } from "#app/components/layouts/app-logo.tsx";
import { NavUser } from "#app/components/layouts/nav-user.tsx";
import { WorkspaceSwitcher } from "#app/components/layouts/workspace-switcher.tsx";
import { listWorkspacesOptions } from "#app/services/query-options.ts";

/**
 * The slim top bar: identity on the left, the two global actions on the right.
 * Replaces the old sidebar's header, switcher and footer.
 */
export function TopBar() {
	const params = useParams({ strict: false });
	const { data: workspaces } = useSuspenseQuery(listWorkspacesOptions());
	const currentWorkspace = workspaces.find((ws) => ws.slug === params.slug);

	return (
		<header className="flex h-12 shrink-0 items-center gap-1 px-4">
			<AppLogo />
			{currentWorkspace ? (
				<>
					<span className="text-faint px-1 text-sm select-none" aria-hidden="true">
						/
					</span>
					<WorkspaceSwitcher selectedWorkspace={currentWorkspace} />
				</>
			) : null}
			<div className="ml-auto flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="Search"
					onClick={() => commandPaletteOpen$.set(true)}
				>
					<MagnifyingGlassIcon />
				</Button>
				<NavUser />
			</div>
		</header>
	);
}
