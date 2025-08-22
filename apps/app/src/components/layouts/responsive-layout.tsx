import { useLayoutMode } from "@/hooks/use-layout-mode";
import { MobileLayout } from "./mobile-layout";
import { SidebarSaysLayout } from "./sidebar-says-layout";

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
	const { mode } = useLayoutMode();
	if (mode === "mobile" || mode === "tablet") {
		return <MobileLayout>{children}</MobileLayout>;
	}
	return <SidebarSaysLayout>{children}</SidebarSaysLayout>;
}
