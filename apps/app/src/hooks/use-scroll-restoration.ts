import { useEffect, useLayoutEffect } from "react";

/**
 * Restore and persist scroll position for a scrollable container.
 *
 * Useful when a component unmounts (e.g. opening a detail panel) and later
 * remounts — the scroll position is restored exactly where the user left off.
 *
 * @param containerRef - Ref to the scrollable DOM element
 * @param scrollRef    - Ref that holds the scrollTop value. Must live in a
 *                       parent component that survives the unmount cycle.
 *
 * @example
 * const listScrollRef = useRef(0);
 * const containerRef = useRef<HTMLDivElement>(null);
 * useScrollRestoration(containerRef, listScrollRef);
 */
export function useScrollRestoration(
	containerRef: React.RefObject<HTMLElement | null>,
	scrollRef: React.MutableRefObject<number> | undefined,
) {
	// Restore scroll position on mount.
	//
	// Root Cause
	//
	// The single requestAnimationFrame wasn't enough. TanStack Virtual measures
	// DOM element heights asynchronously after the initial paint. When we
	// restored scrollTop in the first RAF:
	//
	// 1. Virtualizer had estimated item sizes
	// 2. We set scrollTop -> virtualizer calculated visible range based on estimates
	// 3. Real measurements came in -> virtualizer adjusted range -> content shifted up
	//
	// The second RAF waits until the virtualizer's measurement cycle is complete
	// so scrollTop is applied against stable, accurate item heights.
	useLayoutEffect(() => {
		if (!scrollRef?.current || !containerRef.current) return;
		const raf = requestAnimationFrame(() => {
			const raf2 = requestAnimationFrame(() => {
				if (containerRef.current) {
					containerRef.current.scrollTop = scrollRef.current;
				}
			});
			return () => cancelAnimationFrame(raf2);
		});
		return () => cancelAnimationFrame(raf);
	}, [containerRef, scrollRef]);

	// Persist scroll position as user scrolls
	useEffect(() => {
		const el = containerRef.current;
		if (!el || !scrollRef) return;
		const onScroll = () => {
			scrollRef.current = el.scrollTop;
		};
		el.addEventListener("scroll", onScroll, { passive: true });
		return () => el.removeEventListener("scroll", onScroll);
	}, [containerRef, scrollRef]);
}
