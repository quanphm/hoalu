import { useBreakpoints } from "@hoalu/ui/hooks";

export type LayoutMode = "mobile" | "tablet" | "desktop";

/**
 * Layout detection hook that determines the current layout mode
 * based on viewport size and returns the appropriate layout configuration
 */
export function useLayoutMode(): {
	mode: LayoutMode;
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
	shouldUseMobileLayout: boolean;
	shouldUseTabletLayout: boolean;
	shouldUseDesktopLayout: boolean;
} {
	const { isMobile, isTablet, isDesktop } = useBreakpoints();

	// Determine the primary layout mode
	let mode: LayoutMode = "mobile";
	if (isDesktop) mode = "desktop";
	else if (isTablet) mode = "tablet";

	return {
		mode,
		isMobile,
		isTablet,
		isDesktop,
		// Layout decisions
		shouldUseMobileLayout: isMobile,
		shouldUseTabletLayout: isTablet,
		shouldUseDesktopLayout: isDesktop,
	};
}

/**
 * Simple hook that returns true if mobile layout should be used
 * Convenience hook for components that just need to know mobile vs non-mobile
 */
export function useShouldUseMobileLayout(): boolean {
	const { shouldUseMobileLayout } = useLayoutMode();
	return shouldUseMobileLayout;
}

/**
 * Hook that returns layout configuration for responsive components
 * Useful for components that need to render differently based on layout
 */
export function useResponsiveLayout() {
	const layoutMode = useLayoutMode();
	const { current: currentBreakpoint } = useBreakpoints();

	return {
		...layoutMode,
		currentBreakpoint,
		// Grid configurations
		getGridColumns: () => {
			switch (layoutMode.mode) {
				case "mobile":
					return 1;
				case "tablet":
					return 2;
				case "desktop":
					return 3;
				default:
					return 1;
			}
		},
		// Navigation configurations
		getNavigationType: () => {
			switch (layoutMode.mode) {
				case "mobile":
					return "bottom-tabs";
				case "tablet":
					return "side-rail";
				case "desktop":
					return "sidebar";
				default:
					return "bottom-tabs";
			}
		},
	};
}
