import { useLayoutMode } from "#app/components/layouts/use-layout-mode.ts";

import { MobileLayout } from "./mobile-layout";
import { SidebarSaysLayout } from "./sidebar-says-layout";

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
	const { mode } = useLayoutMode();
	if (mode === "mobile" || mode === "tablet") {
		return <MobileLayout>{children}</MobileLayout>;
	}
	return <SidebarSaysLayout>{children}</SidebarSaysLayout>;
}
