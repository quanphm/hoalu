import { useParams } from "@tanstack/react-router";

import { TopBar } from "#app/components/layouts/top-bar.tsx";
import { TopNav } from "#app/components/layouts/top-nav.tsx";

/**
 * The desktop shell: a slim top bar, the tab strip, then content.
 *
 * `--app-chrome` is the height of everything above the scroll container — 48px
 * top bar + 40px tab strip + its 1px border. Routes that size a full-height list
 * against the viewport subtract it (see `transactions/route.tsx` and friends), so
 * change the chrome and this is the one place to change. It stays unset under
 * `MobileLayout`, where the document scrolls instead and the existing viewport
 * calcs are left alone.
 */
export function DesktopLayout({ children }: { children: React.ReactNode }) {
	const params = useParams({ strict: false });

	return (
		<div className="bg-background flex h-svh flex-col overflow-hidden [--app-chrome:5.5625rem]">
			<TopBar />
			{params.slug ? <TopNav slug={params.slug} /> : null}
			<main data-slot="main-content" className="min-h-0 flex-1 overflow-auto">
				<div className="mx-auto flex w-full max-w-[100rem] flex-col">{children}</div>
			</main>
		</div>
	);
}
