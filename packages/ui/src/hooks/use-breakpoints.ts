import { useMediaQuery } from "./use-media-query";

// Tailwind CSS breakpoints
export const BREAKPOINTS = {
	xs: 0,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Enhanced breakpoint system for mobile-first responsive design
 * Based on Tailwind CSS breakpoints with mobile-first approach
 */
export function useBreakpoint(breakpoint: Breakpoint) {
	const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
	return useMediaQuery(query);
}

/**
 * Get current breakpoint information
 * Returns the active breakpoint and boolean flags for each size
 */
export function useBreakpoints() {
	const sm = useBreakpoint("sm");
	const md = useBreakpoint("md");
	const lg = useBreakpoint("lg");
	const xl = useBreakpoint("xl");
	const xxl = useBreakpoint("2xl");

	// Determine current breakpoint (largest active one)
	let current: Breakpoint = "xs";
	if (xxl) current = "2xl";
	else if (xl) current = "xl";
	else if (lg) current = "lg";
	else if (md) current = "md";
	else if (sm) current = "sm";

	return {
		current,
		xs: !sm, // xs is when sm is false
		sm: sm && !md,
		md: md && !lg,
		lg: lg && !xl,
		xl: xl && !xxl,
		"2xl": xxl,
		// Convenience flags
		isMobile: !md, // < 768px
		isTablet: md && !lg, // 768px - 1023px
		isDesktop: lg, // >= 1024px
		// Size comparisons
		isSmallMobile: !sm, // < 640px
		isLargeMobile: sm && !md, // 640px - 767px
	};
}

/**
 * Check if current viewport is at or above a specific breakpoint
 */
export function useMinBreakpoint(breakpoint: Breakpoint) {
	return useBreakpoint(breakpoint);
}

/**
 * Check if current viewport is below a specific breakpoint
 */
export function useMaxBreakpoint(breakpoint: Breakpoint) {
	const query = `(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`;
	return useMediaQuery(query);
}

/**
 * Check if current viewport is between two breakpoints (inclusive)
 */
export function useBetweenBreakpoints(min: Breakpoint, max: Breakpoint) {
	const minQuery = `(min-width: ${BREAKPOINTS[min]}px)`;
	const maxQuery = `(max-width: ${BREAKPOINTS[max] - 1}px)`;
	const query = `${minQuery} and ${maxQuery}`;
	return useMediaQuery(query);
}
