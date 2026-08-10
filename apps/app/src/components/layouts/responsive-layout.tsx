import { useLayoutMode } from "#app/components/layouts/use-layout-mode.ts";

import { MainLayout } from "./main-layout";
import { MobileLayout } from "./mobile-layout";

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
	const { mode } = useLayoutMode();
	if (mode === "mobile" || mode === "tablet") {
		return <MobileLayout>{children}</MobileLayout>;
	}
	return <MainLayout>{children}</MainLayout>;
}
