import { useEffect, useState } from "react";

/**
 * Hook to detect media query matches
 * @param query - CSS media query string (e.g., "(max-width: 768px)")
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

	useEffect(() => {
		const mediaQuery = window.matchMedia(query);
		const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

		mediaQuery.addEventListener("change", handler);
		return () => mediaQuery.removeEventListener("change", handler);
	}, [query]);

	return matches;
}
