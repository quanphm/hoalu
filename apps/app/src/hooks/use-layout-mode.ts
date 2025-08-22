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

	let mode: LayoutMode = "mobile";
	if (isDesktop) {
		mode = "desktop";
	} else if (isTablet) {
		mode = "tablet";
	}

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
