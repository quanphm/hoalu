import { useMediaQuery } from "#app/hooks/use-media-query.ts";

/**
 * Hook to determine the current layout mode based on viewport size
 * @returns Object with boolean flags for mobile, tablet, and desktop layouts
 */
export function useLayoutMode() {
	const isMobile = useMediaQuery("(max-width: 768px)");
	const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
	const isDesktop = useMediaQuery("(min-width: 1025px)");

	return {
		shouldUseMobileLayout: isMobile,
		shouldUseTabletLayout: isTablet,
		shouldUseDesktopLayout: isDesktop,
	};
}
