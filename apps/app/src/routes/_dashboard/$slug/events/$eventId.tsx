import { EventDetailPanel } from "#app/components/events/event-details.tsx";
import { useLiveQueryEvents } from "#app/components/events/use-events.ts";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffectEvent, useMemo, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const Route = createFileRoute("/_dashboard/$slug/events/$eventId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { eventId } = Route.useParams();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const navigate = useNavigate();
	const events = useLiveQueryEvents();

	const sortedEvents = useMemo(
		() =>
			[...events].sort((a, b) => {
				if (!a.start_date && !b.start_date) return 0;
				if (!a.start_date) return 1;
				if (!b.start_date) return -1;
				return b.start_date.localeCompare(a.start_date);
			}),
		[events],
	);

	const currentIndex = sortedEvents.findIndex((e) => e.public_id === eventId);
	const current = currentIndex >= 0 ? sortedEvents[currentIndex] : undefined;

	const eventsRef = useRef(sortedEvents);
	eventsRef.current = sortedEvents;
	const slugRef = useRef(slug);
	slugRef.current = slug;

	const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const pendingRef = useRef<"up" | "down" | null>(null);

	const flushNav = useEffectEvent(() => {
		const e = eventsRef.current;
		const s = slugRef.current;
		const idx = e.findIndex((ev) => ev.public_id === eventId);
		if (idx < 0) return;
		const targetIdx = pendingRef.current === "down" ? idx + 1 : idx - 1;
		const target = e[targetIdx];
		if (!target) return;
		navigate({
			to: "/$slug/events/$eventId",
			params: { slug: s, eventId: target.public_id },
			replace: true,
		});
		pendingRef.current = null;
	});

	const debouncedNav = useEffectEvent((direction: "up" | "down") => {
		pendingRef.current = direction;
		clearTimeout(timerRef.current);
		timerRef.current = setTimeout(flushNav, 60);
	});

	const handleGoUp = useCallback(() => debouncedNav("up"), []);
	const handleGoDown = useCallback(() => debouncedNav("down"), []);
	const handleClose = useCallback(() => {
		navigate({ to: "/$slug/events", params: { slug } });
	}, [navigate, slug]);

	useHotkeys("j", handleGoDown, [handleGoDown]);
	useHotkeys("k", handleGoUp, [handleGoUp]);
	useHotkeys("esc", handleClose, [handleClose]);

	const canGoUp = currentIndex > 0;
	const canGoDown = currentIndex >= 0 && currentIndex < sortedEvents.length - 1;

	if (!current) return null;

	return (
		<EventDetailPanel
			event={current}
			onClose={handleClose}
			onGoUp={handleGoUp}
			onGoDown={handleGoDown}
			canGoUp={canGoUp}
			canGoDown={canGoDown}
		/>
	);
}
