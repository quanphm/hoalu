import { useEffect, useRef } from "react";
import { useWebHaptics } from "web-haptics/react";

/**
 * Global haptic feedback via click delegation.
 *
 * Detects interactive elements from the click target and fires an appropriate
 * haptic type following Apple HIG conventions. No per-component wiring needed.
 *
 * Override any element with `data-haptic="success|warning|error|light|medium|heavy|selection"`.
 * Opt-out with `data-haptic="none"`.
 */
export function HapticsProvider({ children }: { children: React.ReactNode }) {
	const haptics = useWebHaptics();
	const hapticsRef = useRef(haptics);
	hapticsRef.current = haptics;

	const lastClickTime = useRef(0);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			const target = e.target as HTMLElement;

			// Walk up to the nearest interactive element
			const element = target.closest<HTMLElement>(
				'[data-haptic], button, [role="button"], [role="switch"], [role="checkbox"], [role="tab"], [role="menuitem"], [role="menuitemradio"], a[href]',
			);
			if (!element) return;

			// Debounce rapid taps (50ms)
			const now = Date.now();
			if (now - lastClickTime.current < 50) return;
			lastClickTime.current = now;

			const h = hapticsRef.current;

			// Explicit override via data-haptic attribute
			const explicit = element.getAttribute("data-haptic");
			if (explicit) {
				if (explicit === "none") return;
				h.trigger(explicit as Parameters<typeof h.trigger>[0]);
				return;
			}

			const role = element.getAttribute("role");

			// Destructive detection:
			//  - DropdownMenuItem: data-variant="destructive"
			//  - Button/Badge: CVA class containing "destructive" token
			if (
				element.getAttribute("data-variant") === "destructive" ||
				element.className.includes("destructive")
			) {
				h.trigger("warning");
				return;
			}

			// Toggle switches and checkboxes → light
			if (role === "switch" || role === "checkbox") {
				h.trigger("light");
				return;
			}

			// Tab switches, segment controls → selection
			if (role === "tab") {
				h.trigger("selection");
				return;
			}

			// Menu items → light
			if (role === "menuitem" || role === "menuitemradio") {
				h.trigger("light");
				return;
			}

			// Buttons (including submit) → medium
			const tag = element.tagName;
			if (tag === "BUTTON" || role === "button") {
				h.trigger("medium");
				return;
			}

			// Links → light
			if (tag === "A") {
				h.trigger("light");
				return;
			}
		}

		document.addEventListener("click", handleClick, { capture: true });
		return () => document.removeEventListener("click", handleClick, { capture: true });
	}, []);

	return <>{children}</>;
}
