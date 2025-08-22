import { useAtom } from "jotai";
import { useTheme } from "next-themes";

import { cn } from "@hoalu/ui/utils";
import { mobileBottomNavVisibleAtom } from "@/atoms";
import { useLayoutMode } from "@/hooks/use-layout-mode";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { MobileHeader } from "./mobile-header";
import { MobileSheet } from "./mobile-sheet";
import { SidebarSaysLayout } from "./sidebar-says-layout";

interface MobileLayoutProps {
	children: React.ReactNode;
}

/**
 * Mobile-first responsive layout component
 * Switches between mobile stack layout and desktop sidebar layout
 * based on viewport size and user preferences
 */
export function MobileLayout({ children }: MobileLayoutProps) {
	const { theme } = useTheme();
	const { shouldUseMobileLayout, shouldUseDesktopLayout } = useLayoutMode();
	const [isBottomNavVisible] = useAtom(mobileBottomNavVisibleAtom);

	// Use desktop layout for desktop screens
	if (shouldUseDesktopLayout) {
		return <SidebarSaysLayout>{children}</SidebarSaysLayout>;
	}

	// Use mobile/tablet layout for smaller screens
	return (
		<div className={cn("flex h-screen flex-col bg-background", theme)}>
			{/* Mobile Header */}
			<MobileHeader />

			{/* Main Content Area */}
			<main className="flex-1 overflow-hidden">
				{shouldUseMobileLayout ? (
					// Mobile: Single column stack
					<div className="h-full overflow-y-auto">{children}</div>
				) : (
					// Tablet: Two column split view
					<div className="grid h-full grid-cols-2 gap-4 p-4">{children}</div>
				)}
			</main>

			{/* Spacer for bottom navigation */}
			{shouldUseMobileLayout && isBottomNavVisible && <div className="h-4" />}

			{/* Bottom Navigation (Mobile Only) */}
			{shouldUseMobileLayout && isBottomNavVisible && <MobileBottomNav />}

			{/* Mobile Sheet for modals/details */}
			<MobileSheet />
		</div>
	);
}

/**
 * Responsive layout wrapper that chooses the appropriate layout
 * based on screen size and device capabilities
 */
export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
	const { shouldUseMobileLayout, shouldUseTabletLayout } = useLayoutMode();

	// Always use MobileLayout for mobile and tablet
	// It will handle the desktop case internally
	if (shouldUseMobileLayout || shouldUseTabletLayout) {
		return <MobileLayout>{children}</MobileLayout>;
	}

	// Fallback to desktop layout
	return <SidebarSaysLayout>{children}</SidebarSaysLayout>;
}
