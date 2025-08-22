import { useMediaQuery } from "./use-media-query";

const BREAKPOINTS = {
	xs: 0,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export function useMinBreakpoint(breakpoint: Breakpoint) {
	const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`;
	return useMediaQuery(query);
}

export function useMaxBreakpoint(breakpoint: Breakpoint) {
	const maxWidth = Math.max(0, BREAKPOINTS[breakpoint] - 1);
	const query = `(max-width: ${maxWidth}px)`;
	return useMediaQuery(query);
}

export function useBetweenBreakpoints(min: Breakpoint, max: Breakpoint) {
	const minQuery = `(min-width: ${BREAKPOINTS[min]}px)`;
	const maxWidth = Math.max(0, BREAKPOINTS[max] - 1);
	const maxQuery = `(max-width: ${maxWidth}px)`;
	const query = `${minQuery} and ${maxQuery}`;
	return useMediaQuery(query);
}

export function useBreakpoints() {
	const sm = useMinBreakpoint("sm");
	const md = useMinBreakpoint("md");
	const lg = useMinBreakpoint("lg");
	const xl = useMinBreakpoint("xl");
	const xxl = useMinBreakpoint("2xl");

	let current: Breakpoint = "xs";
	if (xxl) current = "2xl";
	else if (xl) current = "xl";
	else if (lg) current = "lg";
	else if (md) current = "md";
	else if (sm) current = "sm";

	return {
		current,

		xs: !sm,
		sm: sm && !md,
		md: md && !lg,
		lg: lg && !xl,
		xl: xl && !xxl,
		"2xl": xxl,

		/**
		 * smaller than 768px
		 */
		isMobile: !md,
		/**
		 * 768px - 1023px
		 */
		isTablet: md && !lg,
		/**
		 * bigger than 1024px
		 */
		isDesktop: lg,
	};
}
