import { RecurringBillDetailPanel } from "#app/components/recurring-bills/recurring-bill-details.tsx";
import { useAllRecurringBills } from "#app/components/recurring-bills/use-recurring-bills.ts";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffectEvent, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const Route = createFileRoute("/_dashboard/$slug/recurring-bills/$billId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { billId } = Route.useParams();
	const { slug } = useParams({ from: "/_dashboard/$slug" });
	const navigate = useNavigate();
	const bills = useAllRecurringBills();

	const currentIndex = bills.findIndex((b) => b.public_id === billId);
	const current = currentIndex >= 0 ? bills[currentIndex] : undefined;

	const billsRef = useRef(bills);
	billsRef.current = bills;
	const slugRef = useRef(slug);
	slugRef.current = slug;

	const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const pendingRef = useRef<"up" | "down" | null>(null);

	const flushNav = useEffectEvent(() => {
		const b = billsRef.current;
		const s = slugRef.current;
		const idx = b.findIndex((bill) => bill.public_id === billId);
		if (idx < 0) return;
		const targetIdx = pendingRef.current === "down" ? idx + 1 : idx - 1;
		const target = b[targetIdx];
		if (!target) return;
		navigate({
			to: "/$slug/recurring-bills/$billId",
			params: { slug: s, billId: target.public_id },
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
		navigate({ to: "/$slug/recurring-bills", params: { slug } });
	}, [navigate, slug]);

	useHotkeys("j", handleGoDown, [handleGoDown]);
	useHotkeys("k", handleGoUp, [handleGoUp]);
	useHotkeys("esc", handleClose, [handleClose]);

	const canGoUp = currentIndex > 0;
	const canGoDown = currentIndex >= 0 && currentIndex < bills.length - 1;

	if (!current) return null;

	return (
		<RecurringBillDetailPanel
			bill={current}
			onClose={handleClose}
			onGoUp={handleGoUp}
			onGoDown={handleGoDown}
			canGoUp={canGoUp}
			canGoDown={canGoDown}
		/>
	);
}
