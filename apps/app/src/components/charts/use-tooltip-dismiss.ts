import { useEffect, useRef, useState } from "react";

/** A touch pointer never fires `mouseleave`, so Recharts leaves the tooltip pinned after a tap. */
export function useTooltipDismiss<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	const [dismissed, setDismissed] = useState(false);

	useEffect(() => {
		const onPointerDown = (event: PointerEvent) => {
			if (event.pointerType === "mouse") return;
			const node = ref.current;
			if (!node) return;
			setDismissed(!node.contains(event.target as Node));
		};

		// If a mouse shows up after a touch dismissed the tooltip, hand control back.
		const onPointerMove = (event: PointerEvent) => {
			if (event.pointerType !== "mouse") return;
			const node = ref.current;
			if (node?.contains(event.target as Node)) setDismissed(false);
		};

		document.addEventListener("pointerdown", onPointerDown, true);
		document.addEventListener("pointermove", onPointerMove, true);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown, true);
			document.removeEventListener("pointermove", onPointerMove, true);
		};
	}, []);

	return { containerRef: ref, active: dismissed ? false : undefined };
}
